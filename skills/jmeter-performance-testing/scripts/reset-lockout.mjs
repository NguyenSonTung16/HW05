#!/usr/bin/env node
// Mở khóa ĐÚNG các tài khoản test (theo mẫu email), không đụng tài khoản khác.
// Dùng: node reset-lockout.mjs --db <database.sqlite> [--pattern "perf%@test.local"] [--pattern "lock%@test.local"]
//                              [--attempts-col login_attempts] [--locked-col locked_until] [--sut-backend <dir>] [--dry-run]
import { openDb } from './sqlite-open.mjs';

const a = process.argv.slice(2); const o = { pattern: [] };
for (let i = 0; i < a.length; i++) {
  const k = a[i].replace(/^--/, '');
  if (k === 'dry-run') { o.dryRun = true; continue; }
  const v = a[++i];
  if (k === 'pattern') o.pattern.push(v); else o[k] = v;
}
if (!o.db) { console.error('Thiếu --db'); process.exit(2); }
const patterns = o.pattern.length ? o.pattern : ['perf%@test.local', 'lock%@test.local'];
for (const p of patterns) {
  // Chặn mẫu quá rộng: phải có '@'; phần trước '@' bắt đầu bằng >= 2 ký tự cố định (tiền tố như "perf", "lock");
  // phần sau '@' không có ký tự đại diện. Ví dụ "%@test.local" bị từ chối vì sẽ mở khóa mọi tài khoản cùng tên miền.
  const [local = '', domain = ''] = p.split('@');
  if (!p.includes('@') || !domain || /[%_]/.test(domain) || !/^[^%_]{2,}/.test(local)) {
    console.error(`Mẫu quá rộng, từ chối: ${p}`); process.exit(2);
  }
}
const att = o['attempts-col'] ?? 'login_attempts'; const lock = o['locked-col'] ?? 'locked_until';
if (![att, lock].every((c) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(c))) { console.error('Tên cột không hợp lệ'); process.exit(2); }

const db = await openDb(o.db, o['sut-backend']);
let total = 0;
for (const p of patterns) {
  const before = await db.all(`SELECT COUNT(*) AS n, SUM(CASE WHEN ${lock} IS NOT NULL THEN 1 ELSE 0 END) AS locked, SUM(CASE WHEN ${att} > 0 THEN 1 ELSE 0 END) AS dirty FROM users WHERE email LIKE ?`, [p]);
  const b = before[0];
  let changes = 0;
  if (!o.dryRun) ({ changes } = await db.run(`UPDATE users SET ${att} = 0, ${lock} = NULL WHERE email LIKE ? AND (${att} <> 0 OR ${lock} IS NOT NULL)`, [p]));
  total += changes;
  console.log(`${p}: ${b.n} tài khoản, đang khóa ${b.locked ?? 0}, có đếm sai ${b.dirty ?? 0} → ${o.dryRun ? '(dry-run, không sửa)' : `đã reset ${changes}`}`);
}
await db.close();
console.log(`Xong (${db.kind}). Tổng dòng reset: ${total}. Thời điểm: ${new Date().toISOString()}`);
