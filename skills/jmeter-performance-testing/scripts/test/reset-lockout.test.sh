#!/bin/sh
# Kiểm thử reset-lockout.mjs trên BẢN SAO DB (không phải DB thật của SUT). Dùng: sh reset-lockout.test.sh <database.sqlite gốc>
set -e
S="$(cd "$(dirname "$0")/.." && pwd)"; T="$(mktemp -d)"; cp "$1" "$T/db.sqlite"; cd "$T"
node --no-warnings -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('db.sqlite');d.prepare(\"INSERT INTO users(name,email,password,login_attempts,locked_until) VALUES ('a','perf001@test.local','x',4,'2099-01-01T00:00:00Z'),('b','lock01@test.local','x',2,NULL),('c','other@test.local','x',4,'2099-01-01T00:00:00Z')\").run()"
if node --no-warnings "$S/reset-lockout.mjs" --db db.sqlite --pattern '%@test.local' 2>/dev/null; then echo "FAIL: mẫu rộng không bị chặn"; exit 1; fi
node --no-warnings "$S/reset-lockout.mjs" --db db.sqlite >/dev/null
R=$(node --no-warnings -e "const {DatabaseSync}=require('node:sqlite');const d=new DatabaseSync('db.sqlite');console.log(JSON.stringify(d.prepare(\"SELECT email,login_attempts a,locked_until l FROM users WHERE email LIKE '%@test.local' ORDER BY email\").all()))")
[ "$R" = '[{"email":"lock01@test.local","a":0,"l":null},{"email":"other@test.local","a":4,"l":"2099-01-01T00:00:00Z"},{"email":"perf001@test.local","a":0,"l":null}]' ] && echo "PASS reset-lockout" || { echo "FAIL: $R"; exit 1; }
