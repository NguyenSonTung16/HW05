#!/usr/bin/env node
// Chạy MỘT kịch bản JMeter non-GUI và gom bằng chứng vào một thư mục mới.
// Dùng: node run-scenario.mjs --plan <dir>/{MSSV}_{Scenario}_{YYYYMMDD}.jmx --out <thư mục kết quả mới>
//          [-J threads=50 -J rampup=60 ...] [--base http://localhost:3000] [--health-path /api/products]
//          [--jmeter jmeter] [--monitor-match server.js] [--no-monitor] [--bucket 10] [--p95-limit 1000] [--err-limit 1]
// Không reset DB/khóa tài khoản: làm bằng db-snapshot.mjs + khởi động lại backend + reset-lockout.mjs TRƯỚC khi gọi.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { readSamples, summarize, toMarkdown } from './jtl-summary.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const a = process.argv.slice(2); const o = { J: [] };
for (let i = 0; i < a.length; i++) {
  const k = a[i];
  if (k === '-J') o.J.push(a[++i]);
  else if (k === '--no-monitor') o.noMonitor = true;
  else o[k.replace(/^--/, '')] = a[++i];
}
const die = (m) => { console.error(m); process.exit(2); };
if (!o.plan || !o.out) die('Thiếu --plan hoặc --out');
const planName = path.basename(o.plan);
const m = planName.match(/^(\d{8})_(Smoke|Load|Stress|Spike|Soak)_(\d{8})\.jmx$/);
if (!m) die(`Tên plan sai quy ước {MSSV}_{Scenario}_{YYYYMMDD}.jmx: ${planName}`);
if (!fs.existsSync(o.plan)) die(`Không thấy plan: ${o.plan}`);
for (const kv of o.J) if (!/^[A-Za-z_.][\w.]*=.*/.test(kv)) die(`-J sai dạng key=value: ${kv}`);
if (fs.existsSync(o.out) && fs.readdirSync(o.out).length) die(`Thư mục kết quả đã có dữ liệu, không ghi đè: ${o.out}`);
fs.mkdirSync(o.out, { recursive: true });

const base = o.base ?? 'http://localhost:3000';
const health = await fetch(base + (o['health-path'] ?? '/api/products'), { signal: AbortSignal.timeout(5000) }).then((r) => r.status).catch((e) => `lỗi: ${e.message}`);
if (health !== 200) die(`SUT chưa sẵn sàng (${base}): ${health}`);

const jtl = path.join(o.out, planName.replace(/\.jmx$/, '.jtl'));
const meta = {
  plan: planName, studentId: m[1], scenario: m[2], planDate: m[3], props: o.J, base,
  hostname: os.hostname(), platform: `${os.type()} ${os.release()} ${os.arch()}`, cpu: os.cpus()[0]?.model, logicalCores: os.cpus().length,
  totalMemGB: Math.round((os.totalmem() / 2 ** 30) * 10) / 10, node: process.version, startIso: new Date().toISOString(),
};
const metaFile = path.join(o.out, 'run-meta.json');
fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));

let mon = null; const usage = path.join(o.out, 'node-usage.csv');
if (!o.noMonitor) {
  if (process.platform !== 'win32') console.warn('monitor-node.ps1 chỉ chạy trên Windows; bỏ qua giám sát (ghi chú vào báo cáo, dùng htop/pidstat).');
  else {
    mon = spawn('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(here, 'monitor-node.ps1'), '-Match', o['monitor-match'] ?? 'server.js', '-Out', usage], { stdio: 'inherit' });
    await new Promise((r) => setTimeout(r, 2000));
    if (mon.exitCode !== null) die('Không bật được giám sát tài nguyên (xem lỗi ở trên); dùng --no-monitor nếu chấp nhận thiếu.');
  }
}

const args = ['-n', '-t', o.plan, '-l', jtl, '-e', '-o', path.join(o.out, 'html'), '-j', path.join(o.out, 'jmeter.log'),
  '-Jjmeter.save.saveservice.output_format=csv', '-Jjmeter.save.saveservice.print_field_names=true',
  '-Jjmeter.save.saveservice.thread_counts=true', '-Jjmeter.save.saveservice.latency=true', '-Jjmeter.save.saveservice.connect_time=true',
  ...o.J.map((kv) => `-J${kv}`)];
console.log(`\n=== ${planName} | ${meta.startIso} | host ${meta.hostname} ===\n${o.jmeter ?? 'jmeter'} ${args.join(' ')}\n`);
const code = await new Promise((ok) => {
  const p = spawn(o.jmeter ?? 'jmeter', args, { stdio: 'inherit', shell: process.platform === 'win32' });
  p.on('exit', (c) => ok(c)); p.on('error', (e) => { console.error(`Không chạy được JMeter: ${e.message}`); ok(-1); });
});

if (mon) {
  fs.writeFileSync(usage + '.stop', '');
  await new Promise((ok) => { const t = setTimeout(() => { mon.kill(); ok(); }, 5000); mon.on('exit', () => { clearTimeout(t); ok(); }); });
}
meta.endIso = new Date().toISOString(); meta.jmeterExitCode = code;
fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2));
if (code !== 0 || !fs.existsSync(jtl)) { console.error(`JMeter kết thúc với mã ${code}; xem ${path.join(o.out, 'jmeter.log')}`); process.exit(1); }

const { samples, badLines } = readSamples(fs.readFileSync(jtl, 'utf8'));
const r = summarize(samples, { bucket: Number(o.bucket ?? 10), p95Limit: Number(o['p95-limit'] ?? 1000), errLimit: Number(o['err-limit'] ?? 1) });
r.badLines = badLines; r.run = meta;
let md = toMarkdown(path.basename(jtl), r);
if (fs.existsSync(usage)) {
  const rows = fs.readFileSync(usage, 'utf8').replace(/^﻿/, '').trim().split(/\r?\n/).slice(1).map((l) => l.split(','));
  if (rows.length) {
    const cpu = rows.map((x) => Number(x[2])); const ws = rows.map((x) => Number(x[3]));
    r.backendUsage = { samples: rows.length, cpuAvg: Math.round((cpu.reduce((s, v) => s + v, 0) / cpu.length) * 10) / 10, cpuMax: Math.max(...cpu),
      workingSetStartMb: ws[0], workingSetEndMb: ws.at(-1), workingSetMaxMb: Math.max(...ws) };
    const u = r.backendUsage;
    md += `\n## Tài nguyên backend (node-usage.csv, ${u.samples} mẫu)\n- CPU trung bình ${u.cpuAvg}% / tối đa ${u.cpuMax}% (chia theo ${meta.logicalCores} lõi)\n- RAM (working set) đầu ${u.workingSetStartMb} MB, cuối ${u.workingSetEndMb} MB, đỉnh ${u.workingSetMaxMb} MB\n`;
  }
}
fs.writeFileSync(path.join(o.out, 'summary.md'), md);
fs.writeFileSync(path.join(o.out, 'summary.json'), JSON.stringify(r, null, 2));
console.log(`\nXong. Kết quả: ${o.out} (jtl, html/, jmeter.log, run-meta.json, summary.md${fs.existsSync(usage) ? ', node-usage.csv' : ''})`);
console.log(`Tổng: ${r.total.samples} mẫu, lỗi ${r.total.errorPct}%, p95 ${r.total.p95} ms, ${r.total.throughput} req/s`);
