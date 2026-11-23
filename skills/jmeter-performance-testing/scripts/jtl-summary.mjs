#!/usr/bin/env node
// Tính số liệu hiệu năng TẤT ĐỊNH từ file .jtl (CSV) của JMeter. Đây là "giá trị đúng" để đối chiếu với phân tích của AI.
// Dùng:
//   node jtl-summary.mjs <file.jtl> [--from-sec N] [--to-sec N] [--bucket 10] [--p95-limit 1000] [--err-limit 1]
//                        [--md out.md] [--json out.json]
// - Mốc thời gian tính từ timeStamp nhỏ nhất trong file (giây 0 = mẫu đầu tiên bắt đầu).
// - --from-sec/--to-sec: chỉ lấy mẫu có thời điểm bắt đầu trong [from, to) (ví dụ bỏ giai đoạn ramp-up).
// - Phân vị: nearest-rank (giá trị thứ ceil(p/100*n) sau khi sắp xếp). Dashboard JMeter dùng thuật toán khác nên có thể lệch nhẹ.
// - Throughput = số mẫu / (kết thúc muộn nhất - bắt đầu sớm nhất), giống cách JMeter tính.
// - Thời gian đáp ứng tính trên MỌI mẫu (như JMeter) và riêng mẫu thành công (cột *_ok).
// - Nhóm = phần trước dấu cách đầu tiên của label (AUTH, READ, TXN...).
import fs from 'node:fs';

export function parseCsv(text) {
  const rows = []; let row = []; let field = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = ''; rows.push(row); row = [];
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

const DEFAULT_HEADER = ['timeStamp', 'elapsed', 'label', 'responseCode', 'responseMessage', 'threadName', 'dataType', 'success',
  'failureMessage', 'bytes', 'sentBytes', 'grpThreads', 'allThreads', 'URL', 'Latency', 'IdleTime', 'Connect'];

export function readSamples(text) {
  const rows = parseCsv(text.replace(/^﻿/, ''));
  if (!rows.length) throw new Error('File .jtl rỗng');
  let header = DEFAULT_HEADER; let start = 0;
  if (rows[0].includes('timeStamp')) { header = rows[0]; start = 1; }
  const ix = Object.fromEntries(header.map((h, i) => [h, i]));
  for (const need of ['timeStamp', 'elapsed', 'label', 'success']) if (ix[need] === undefined) throw new Error(`Thiếu cột ${need}`);
  const out = []; const bad = [];
  for (let r = start; r < rows.length; r++) {
    const x = rows[r];
    const ts = Number(x[ix.timeStamp]); const el = Number(x[ix.elapsed]);
    if (!Number.isFinite(ts) || !Number.isFinite(el)) { bad.push(r + 1); continue; }
    out.push({
      line: r + 1, ts, elapsed: el, label: x[ix.label], code: x[ix.responseCode] ?? '', success: x[ix.success] === 'true',
      failureMessage: x[ix.failureMessage] ?? '', allThreads: Number(x[ix.allThreads] ?? NaN),
      latency: Number(x[ix.Latency] ?? NaN), connect: Number(x[ix.Connect] ?? NaN),
    });
  }
  return { samples: out, badLines: bad, header };
}

export function percentile(sorted, p) {
  if (!sorted.length) return null;
  const k = Math.max(1, Math.ceil((p / 100) * sorted.length));
  return sorted[k - 1];
}

// Không trải mảng thành đối số cho Math.min/Math.max: với vài trăm nghìn mẫu sẽ tràn stack (RangeError).
export function minOf(arr, f = (x) => x) { let m = Infinity; for (const x of arr) { const v = f(x); if (v < m) m = v; } return m; }
export function maxOf(arr, f = (x) => x) { let m = -Infinity; for (const x of arr) { const v = f(x); if (v > m) m = v; } return m; }

function stats(list) {
  const n = list.length;
  if (!n) return null;
  const el = list.map((s) => s.elapsed).sort((a, b) => a - b);
  const ok = list.filter((s) => s.success).map((s) => s.elapsed).sort((a, b) => a - b);
  const errors = n - ok.length;
  const t0 = minOf(list, (s) => s.ts);
  const t1 = maxOf(list, (s) => s.ts + s.elapsed);
  const spanSec = (t1 - t0) / 1000;
  const codes = {};
  for (const s of list) codes[s.code] = (codes[s.code] ?? 0) + 1;
  const r1 = (v) => (v === null ? null : Math.round(v * 10) / 10);
  return {
    samples: n, errors, errorPct: r1((errors / n) * 100),
    avg: r1(el.reduce((a, b) => a + b, 0) / n), min: el[0], max: el[n - 1],
    p50: percentile(el, 50), p90: percentile(el, 90), p95: percentile(el, 95), p99: percentile(el, 99),
    avg_ok: ok.length ? r1(ok.reduce((a, b) => a + b, 0) / ok.length) : null, p95_ok: percentile(ok, 95),
    throughput: spanSec > 0 ? r1(n / spanSec) : null, spanSec: r1(spanSec), codes,
  };
}

export function summarize(samples, opt = {}) {
  const bucket = opt.bucket ?? 10; const p95Limit = opt.p95Limit ?? 1000; const errLimit = opt.errLimit ?? 1;
  if (!samples.length) throw new Error('Không có mẫu hợp lệ');
  const base = minOf(samples, (s) => s.ts);
  let sel = samples;
  if (opt.fromSec !== undefined) sel = sel.filter((s) => (s.ts - base) / 1000 >= opt.fromSec);
  if (opt.toSec !== undefined) sel = sel.filter((s) => (s.ts - base) / 1000 < opt.toSec);
  if (!sel.length) throw new Error('Cửa sổ thời gian không có mẫu nào');

  const by = (keyFn) => {
    const m = new Map();
    for (const s of sel) { const k = keyFn(s); if (!m.has(k)) m.set(k, []); m.get(k).push(s); }
    return Object.fromEntries([...m.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, stats(v)]));
  };

  const buckets = new Map();
  for (const s of sel) {
    const b = Math.floor((s.ts - base) / 1000 / bucket);
    if (!buckets.has(b)) buckets.set(b, []);
    buckets.get(b).push(s);
  }
  const series = [...buckets.entries()].sort(([a], [b]) => a - b).map(([b, list]) => {
    const st = stats(list);
    return {
      fromSec: b * bucket, toSec: (b + 1) * bucket, samples: st.samples, rps: Math.round((st.samples / bucket) * 10) / 10,
      errorPct: st.errorPct, p95: st.p95, avg: st.avg, maxThreads: maxOf(list, (s) => (Number.isFinite(s.allThreads) ? s.allThreads : 0)),
    };
  });
  const healthy = series.filter((w) => w.errorPct <= errLimit && w.p95 <= p95Limit);
  const firstBreach = series.find((w) => !(w.errorPct <= errLimit && w.p95 <= p95Limit)) ?? null;

  const failures = {};
  for (const s of sel.filter((x) => !x.success)) {
    const k = `${s.label} | ${s.code} | ${s.failureMessage.split('\n')[0].slice(0, 120)}`;
    if (!failures[k]) failures[k] = { count: 0, firstLine: s.line };
    failures[k].count++;
  }

  return {
    method: { percentile: 'nearest-rank', throughput: 'samples / (lastEnd - firstStart)', bucketSec: bucket, p95LimitMs: p95Limit, errLimitPct: errLimit,
      window: { fromSec: opt.fromSec ?? 0, toSec: opt.toSec ?? null } },
    total: stats(sel), groups: by((s) => s.label.split(' ')[0]), labels: by((s) => s.label), series,
    stability: {
      healthyWindows: healthy.length, windows: series.length,
      maxHealthyRps: healthy.length ? maxOf(healthy, (w) => w.rps) : null,
      firstBreach,
    },
    failures,
  };
}

function table(obj) {
  const head = '| Tên | Mẫu | Lỗi % | Avg | p50 | p90 | p95 | p99 | Max | p95 (chỉ OK) | RPS | Mã trả về |\n|---|---|---|---|---|---|---|---|---|---|---|---|';
  const rows = Object.entries(obj).map(([k, s]) =>
    `| ${k} | ${s.samples} | ${s.errorPct} | ${s.avg} | ${s.p50} | ${s.p90} | ${s.p95} | ${s.p99} | ${s.max} | ${s.p95_ok ?? '–'} | ${s.throughput ?? '–'} | ${Object.entries(s.codes).map(([c, n]) => `${c}:${n}`).join(' ')} |`);
  return [head, ...rows].join('\n');
}

export function toMarkdown(file, r) {
  const m = r.method;
  const lines = [
    `# Tóm tắt ${file}`,
    `Tính bởi jtl-summary.mjs. Phân vị ${m.percentile}; throughput = ${m.throughput}; cửa sổ ${m.window.fromSec}s → ${m.window.toSec ?? 'hết'}; đơn vị thời gian ms.`,
    '', '## Tổng', table({ TOTAL: r.total }), '', '## Theo nhóm', table(r.groups), '', '## Theo label', table(r.labels), '',
    `## Ổn định (cửa sổ ${m.bucketSec}s; khỏe = lỗi ≤ ${m.errLimitPct}% và p95 ≤ ${m.p95LimitMs} ms)`,
    `- Cửa sổ khỏe: ${r.stability.healthyWindows}/${r.stability.windows}; RPS cao nhất trong cửa sổ khỏe: ${r.stability.maxHealthyRps ?? '–'}`,
    `- Cửa sổ vi phạm đầu tiên: ${r.stability.firstBreach ? `${r.stability.firstBreach.fromSec}–${r.stability.firstBreach.toSec}s, threads ${r.stability.firstBreach.maxThreads}, lỗi ${r.stability.firstBreach.errorPct}%, p95 ${r.stability.firstBreach.p95} ms` : 'không có'}`,
    '', '| Từ (s) | Đến (s) | Mẫu | RPS | Lỗi % | p95 | Avg | Threads |', '|---|---|---|---|---|---|---|---|',
    ...r.series.map((w) => `| ${w.fromSec} | ${w.toSec} | ${w.samples} | ${w.rps} | ${w.errorPct} | ${w.p95} | ${w.avg} | ${w.maxThreads} |`),
    '', '## Lỗi (label | mã | thông điệp → số lần, dòng đầu tiên trong .jtl)',
    ...(Object.keys(r.failures).length ? Object.entries(r.failures).map(([k, v]) => `- ${k} → ${v.count} lần, dòng ${v.firstLine}`) : ['- Không có']),
  ];
  return lines.join('\n') + '\n';
}

function main() {
  const a = process.argv.slice(2);
  if (!a.length || a[0].startsWith('--')) { console.error('Dùng: node jtl-summary.mjs <file.jtl> [--from-sec N] [--to-sec N] [--bucket S] [--p95-limit MS] [--err-limit PCT] [--md f] [--json f]'); process.exit(2); }
  const file = a[0]; const o = {};
  for (let i = 1; i < a.length; i += 2) o[a[i].replace(/^--/, '')] = a[i + 1];
  const num = (k) => (o[k] === undefined ? undefined : Number(o[k]));
  const { samples, badLines } = readSamples(fs.readFileSync(file, 'utf8'));
  const r = summarize(samples, { fromSec: num('from-sec'), toSec: num('to-sec'), bucket: num('bucket'), p95Limit: num('p95-limit'), errLimit: num('err-limit') });
  r.badLines = badLines;
  const md = toMarkdown(file, r) + (badLines.length ? `\nDòng không đọc được: ${badLines.slice(0, 20).join(', ')}${badLines.length > 20 ? '…' : ''}\n` : '');
  if (o.md) fs.writeFileSync(o.md, md); else process.stdout.write(md);
  if (o.json) fs.writeFileSync(o.json, JSON.stringify(r, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('jtl-summary.mjs')) main();
