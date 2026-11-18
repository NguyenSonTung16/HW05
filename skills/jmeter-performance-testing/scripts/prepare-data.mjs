#!/usr/bin/env node
// Tạo tài khoản test qua API (không tạo trùng) và xuất CSV cho plan JMeter.
// Dùng: node prepare-data.mjs --out perf/data [--base http://localhost:3000] [--users 100] [--lock 10]
//                             [--password Perf@12345] [--wrong SaiMatKhau!] [--domain test.local] [--force]
// Kiểm tra tồn tại bằng đăng nhập đúng mật khẩu: 200 = đã có; 403 = đã có nhưng đang khóa (chạy reset-lockout);
// 401 = chưa có (hoặc có với mật khẩu khác, không phân biệt được qua API) → đăng ký rồi đăng nhập lại để xác nhận.
import fs from 'node:fs';
import path from 'node:path';

const a = process.argv.slice(2); const o = {};
for (let i = 0; i < a.length; i++) { const k = a[i].replace(/^--/, ''); if (k === 'force') o.force = true; else o[k] = a[++i]; }
if (!o.out) { console.error('Thiếu --out <thư mục data>'); process.exit(2); }
const base = o.base ?? 'http://localhost:3000';
const nUsers = Number(o.users ?? 100); const nLock = Number(o.lock ?? 10);
const pw = o.password ?? 'Perf@12345'; const wrong = o.wrong ?? 'SaiMatKhau!'; const domain = o.domain ?? 'test.local';
const clean = (s) => String(s).replace(/["\\,\r\n]/g, ' ').replace(/\s+/g, ' ').trim();

async function post(p, body) {
  const r = await fetch(base + p, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.status;
}
async function ensure(email, password, name) {
  let s = await post('/api/login', { email, password });
  if (s === 200) return 'có sẵn';
  if (s === 403) return 'có sẵn, ĐANG KHÓA';
  if (s !== 401) throw new Error(`${email}: login trả ${s}`);
  const rs = await post('/api/register', { name, email, password });
  if (rs !== 200 && rs !== 201) throw new Error(`${email}: register trả ${rs}`);
  s = await post('/api/login', { email, password });
  if (s !== 200) throw new Error(`${email}: đăng ký xong nhưng login trả ${s}`);
  return 'mới tạo';
}

const files = ['users.csv', 'lock-users.csv', 'products.csv', 'orders.csv'].map((f) => path.join(o.out, f));
const existing = files.filter((f) => fs.existsSync(f));
if (existing.length && !o.force) { console.error(`Đã có: ${existing.join(', ')} (thêm --force để ghi đè)`); process.exit(1); }

const pr = await fetch(base + '/api/products');
if (pr.status !== 200) { console.error(`GET /api/products trả ${pr.status}`); process.exit(1); }
const products = (await pr.json()).filter((p) => Number.isFinite(Number(p.id)) && Number(p.price) > 0);
if (!products.length) { console.error('Không có sản phẩm hợp lệ'); process.exit(1); }

const tally = {};
const users = []; const locks = [];
for (let i = 1; i <= nUsers; i++) {
  const email = `perf${String(i).padStart(3, '0')}@${domain}`;
  const st = await ensure(email, pw, `Perf User ${i}`); tally[st] = (tally[st] ?? 0) + 1; users.push(`${email},${pw}`);
}
for (let i = 1; i <= nLock; i++) {
  const email = `lock${String(i).padStart(2, '0')}@${domain}`;
  const st = await ensure(email, pw, `Lock Probe ${i}`); tally[st] = (tally[st] ?? 0) + 1; locks.push(`${email},${wrong}`);
}

fs.mkdirSync(o.out, { recursive: true });
fs.writeFileSync(files[0], ['email,password', ...users].join('\n') + '\n');
fs.writeFileSync(files[1], ['lock_email,wrong_password', ...locks].join('\n') + '\n');
fs.writeFileSync(files[2], ['product_id,product_name,price,keyword',
  ...products.map((p) => { const n = clean(p.name); const kw = (n.split(' ').find((w) => w.length >= 2) ?? n).slice(0, 20); return `${p.id},${n},${Number(p.price)},${kw}`; })].join('\n') + '\n');
const addrs = ['227 Nguyen Van Cu Q5 TP HCM', '135 Tran Hung Dao Q1 TP HCM', '10 Le Loi Q1 TP HCM', '1 Vo Van Ngan Thu Duc'];
fs.writeFileSync(files[3], ['quantity,shipping_address', ...Array.from({ length: 8 }, (_, i) => `${(i % 2) + 1},${addrs[i % addrs.length]}`)].join('\n') + '\n');

console.log(`Tài khoản: ${JSON.stringify(tally)}; sản phẩm: ${products.length}; CSV ghi vào ${path.resolve(o.out)} lúc ${new Date().toISOString()}`);
if (tally['có sẵn, ĐANG KHÓA']) console.log('Có tài khoản đang khóa: chạy reset-lockout.mjs trước khi test.');
