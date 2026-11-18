// Kiểm thử luồng run-scenario.mjs bằng JMeter GIẢ và một HTTP server giả (không phải SUT).
// Chạy: node --test scripts/test/run-scenario.test.mjs
import test from 'node:test'; import assert from 'node:assert/strict';
import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { spawnSync, spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const script = path.join(here, '..', 'run-scenario.mjs');
const fakeJ = path.join(here, 'fake-jmeter.sh');
fs.writeFileSync(fakeJ, `#!/bin/sh\nexec node "${path.join(here, 'fake-jmeter.mjs')}" "$@"\n`, { mode: 0o755 });

async function withServer(fn) {
  const srv = http.createServer((q, r) => { r.writeHead(200, { 'Content-Type': 'application/json' }); r.end('[]'); });
  await new Promise((ok) => srv.listen(0, ok));
  try { return await fn(`http://127.0.0.1:${srv.address().port}`); } finally { srv.close(); }
}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'rs-'));
const run = (args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
// Bản bất đồng bộ: cần khi server giả chạy trong cùng tiến trình (spawnSync sẽ chặn server).
const runAsync = (args) => new Promise((ok) => {
  const p = spawn(process.execPath, [script, ...args]); let stdout = '', stderr = '';
  p.stdout.on('data', (d) => (stdout += d)); p.stderr.on('data', (d) => (stderr += d));
  p.on('exit', (status) => ok({ status, stdout, stderr }));
});

test('từ chối tên plan sai quy ước', () => {
  const r = run(['--plan', '/x/load.jmx', '--out', path.join(tmp(), 'o')]);
  assert.equal(r.status, 2); assert.match(r.stderr, /quy ước/);
});

test('chạy đủ luồng với JMeter giả, sinh summary và run-meta', async () => {
  const d = tmp(); const plan = path.join(d, '23120399_Load_20261119.jmx'); fs.writeFileSync(plan, '<jmeterTestPlan/>');
  await withServer(async (base) => {
    const out = path.join(d, 'res');
    const r = await runAsync(['--plan', plan, '--out', out, '--base', base, '--jmeter', fakeJ, '--no-monitor', '-J', 'threads=5']);
    assert.equal(r.status, 0, r.stderr + r.stdout);
    assert.ok(fs.existsSync(path.join(out, '23120399_Load_20261119.jtl')));
    const meta = JSON.parse(fs.readFileSync(path.join(out, 'run-meta.json'), 'utf8'));
    assert.equal(meta.scenario, 'Load'); assert.equal(meta.jmeterExitCode, 0); assert.deepEqual(meta.props, ['threads=5']);
    assert.match(fs.readFileSync(path.join(out, 'summary.md'), 'utf8'), /TOTAL \| 6 \| 16.7/);
    // lần 2 vào cùng thư mục phải bị từ chối
    const r2 = await runAsync(['--plan', plan, '--out', out, '--base', base, '--jmeter', fakeJ, '--no-monitor']);
    assert.equal(r2.status, 2); assert.match(r2.stderr, /không ghi đè/);
  });
});

test('dừng khi SUT không phản hồi', () => {
  const d = tmp(); const plan = path.join(d, '23120399_Spike_20261119.jmx'); fs.writeFileSync(plan, '<x/>');
  const r = run(['--plan', plan, '--out', path.join(d, 'o'), '--base', 'http://127.0.0.1:1', '--no-monitor']);
  assert.equal(r.status, 2); assert.match(r.stderr, /chưa sẵn sàng/);
});
