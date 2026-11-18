// Kiểm thử prepare-data.mjs với API GIẢ (mô phỏng /api/login, /api/register, /api/products; không phải SUT).
// Chạy: node --test scripts/test/prepare-data.test.mjs
import test from 'node:test'; import assert from 'node:assert/strict';
import http from 'node:http'; import fs from 'node:fs'; import os from 'node:os'; import path from 'node:path';
import { spawn } from 'node:child_process'; import { fileURLToPath } from 'node:url';
const script = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'prepare-data.mjs');

function fakeApi() {
  const users = new Map([['perf001@test.local', { pw: 'Perf@12345', locked: false }], ['lock01@test.local', { pw: 'Perf@12345', locked: true }]]);
  let registers = 0;
  const srv = http.createServer((q, r) => {
    let b = ''; q.on('data', (d) => (b += d)); q.on('end', () => {
      const send = (c, j) => { r.writeHead(c, { 'Content-Type': 'application/json' }); r.end(JSON.stringify(j)); };
      if (q.url === '/api/products') return send(200, [{ id: 1, name: "iPhone 15, \"Pro\" Max", price: 30000000 }, { id: 3, name: "O'Neil Phone", price: 100 }, { id: 2, name: 'Bad', price: 0 }]);
      const x = b ? JSON.parse(b) : {};
      if (q.url === '/api/register') { registers++; users.set(x.email, { pw: x.password, locked: false }); return send(200, { id: users.size }); }
      if (q.url === '/api/login') { const u = users.get(x.email); if (!u) return send(401, {}); if (u.locked) return send(403, {}); return send(u.pw === x.password ? 200 : 401, {}); }
      send(404, {});
    });
  });
  return { srv, registers: () => registers };
}
const runAsync = (args) => new Promise((ok) => {
  const p = spawn(process.execPath, [script, ...args]); let out = '', err = '';
  p.stdout.on('data', (d) => (out += d)); p.stderr.on('data', (d) => (err += d)); p.on('exit', (status) => ok({ status, out, err }));
});

test('không tạo trùng, báo tài khoản đang khóa, CSV sạch ký tự phá JSON, từ chối ghi đè', async () => {
  const api = fakeApi(); await new Promise((ok) => api.srv.listen(0, ok));
  const base = `http://127.0.0.1:${api.srv.address().port}`; const out = fs.mkdtempSync(path.join(os.tmpdir(), 'pd-'));
  try {
    const r = await runAsync(['--out', out, '--base', base, '--users', '3', '--lock', '2']);
    assert.equal(r.status, 0, r.err);
    assert.equal(api.registers(), 3); // perf002, perf003, lock02 (perf001 có sẵn, lock01 có sẵn nhưng khóa)
    assert.match(r.out, /ĐANG KHÓA/);
    const products = fs.readFileSync(path.join(out, 'products.csv'), 'utf8').trim().split('\n');
    assert.deepEqual(products, ['product_id,product_name,price,keyword', '1,iPhone 15 Pro Max,30000000,iPhone', '3,O Neil Phone,100,Neil']); // bỏ dấu nháy đơn: SUT nối từ khóa vào SQL
    assert.equal(fs.readFileSync(path.join(out, 'users.csv'), 'utf8').trim().split('\n').length, 4);
    assert.match(fs.readFileSync(path.join(out, 'lock-users.csv'), 'utf8'), /lock02@test.local,SaiMatKhau!/);
    const again = await runAsync(['--out', out, '--base', base, '--users', '3', '--lock', '2']);
    assert.equal(again.status, 1); assert.match(again.err, /--force/);
    const acc = await runAsync(['--accounts-only', '--base', base, '--users', '4', '--lock', '2']);
    assert.equal(acc.status, 0, acc.err); assert.match(acc.out, /không ghi CSV/);
    assert.equal(api.registers(), 4); // chỉ thêm perf004
    assert.equal(fs.readFileSync(path.join(out, 'users.csv'), 'utf8').trim().split('\n').length, 4); // CSV giữ nguyên
  } finally { api.srv.close(); }
});
