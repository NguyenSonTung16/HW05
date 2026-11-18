#!/usr/bin/env node
// Lưu / khôi phục bản DB sạch. Yêu cầu backend ĐÃ DỪNG (tránh copy file SQLite đang ghi dở và để xóa trạng thái trong bộ nhớ).
// Dùng: node db-snapshot.mjs save|restore --db <database.sqlite> --snapshot <file> [--base http://localhost:3000] [--force]
import fs from 'node:fs';
import path from 'node:path';

const [cmd, ...a] = process.argv.slice(2); const o = {};
for (let i = 0; i < a.length; i++) { const k = a[i].replace(/^--/, ''); if (k === 'force') o.force = true; else o[k] = a[++i]; }
if (!['save', 'restore'].includes(cmd) || !o.db || !o.snapshot) { console.error('Dùng: node db-snapshot.mjs save|restore --db <file> --snapshot <file> [--base url] [--force]'); process.exit(2); }
const base = o.base ?? 'http://localhost:3000';

async function alive() {
  try { const r = await fetch(base, { signal: AbortSignal.timeout(1500) }); return r.status > 0; } catch { return false; }
}
if (await alive()) { console.error(`Backend ở ${base} vẫn đang chạy. Dừng backend trước khi ${cmd}.`); process.exit(1); }

const sidecars = ['-wal', '-shm', '-journal'];
if (cmd === 'save') {
  if (fs.existsSync(o.snapshot) && !o.force) { console.error(`Snapshot đã tồn tại: ${o.snapshot} (thêm --force để ghi đè)`); process.exit(1); }
  fs.mkdirSync(path.dirname(path.resolve(o.snapshot)), { recursive: true });
  fs.copyFileSync(o.db, o.snapshot);
  for (const s of sidecars) if (fs.existsSync(o.db + s)) fs.copyFileSync(o.db + s, o.snapshot + s);
  console.log(`Đã lưu ${o.db} → ${o.snapshot} (${fs.statSync(o.snapshot).size} byte) lúc ${new Date().toISOString()}`);
} else {
  if (!fs.existsSync(o.snapshot)) { console.error(`Không có snapshot: ${o.snapshot}`); process.exit(1); }
  fs.copyFileSync(o.snapshot, o.db);
  for (const s of sidecars) {
    if (fs.existsSync(o.snapshot + s)) fs.copyFileSync(o.snapshot + s, o.db + s);
    else if (fs.existsSync(o.db + s)) fs.truncateSync(o.db + s, 0); // không xóa file, chỉ làm rỗng sidecar cũ
  }
  console.log(`Đã khôi phục ${o.snapshot} → ${o.db} lúc ${new Date().toISOString()}. Khởi động lại backend rồi mới chạy.`);
}
