// Mở file SQLite: ưu tiên node:sqlite (Node >= 22.13), nếu không có thì dùng gói sqlite3 trong thư mục backend của SUT.
// Trả về { run(sql, params) -> {changes}, all(sql, params) -> rows, close() } (đều là Promise).
import { createRequire } from 'node:module';
import path from 'node:path';

export async function openDb(dbFile, sutBackendDir) {
  try {
    const emit = process.emitWarning;
    process.emitWarning = (w, ...rest) => (String(w).includes('SQLite') ? undefined : emit.call(process, w, ...rest));
    let DatabaseSync;
    try { ({ DatabaseSync } = await import('node:sqlite')); } finally { process.emitWarning = emit; }
    const db = new DatabaseSync(dbFile);
    return {
      kind: 'node:sqlite',
      run: async (sql, p = []) => ({ changes: Number(db.prepare(sql).run(...p).changes) }),
      all: async (sql, p = []) => db.prepare(sql).all(...p),
      close: async () => db.close(),
    };
  } catch (e) {
    const dir = sutBackendDir ?? path.dirname(dbFile);
    const require = createRequire(path.join(dir, 'package.json'));
    const sqlite3 = require('sqlite3');
    const db = await new Promise((ok, no) => { const d = new sqlite3.Database(dbFile, (err) => (err ? no(err) : ok(d))); });
    return {
      kind: 'sqlite3',
      run: (sql, p = []) => new Promise((ok, no) => db.run(sql, p, function (err) { err ? no(err) : ok({ changes: this.changes }); })),
      all: (sql, p = []) => new Promise((ok, no) => db.all(sql, p, (err, rows) => (err ? no(err) : ok(rows)))),
      close: () => new Promise((ok) => db.close(() => ok())),
    };
  }
}
