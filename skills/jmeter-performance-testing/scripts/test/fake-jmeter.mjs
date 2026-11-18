#!/usr/bin/env node
// JMeter GIẢ để kiểm thử luồng của run-scenario.mjs: chép FAKE-sample.jtl vào đường dẫn -l và tạo thư mục -o rỗng.
// Không bao giờ dùng để sinh bằng chứng nộp bài.
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const a = process.argv.slice(2); const get = (f) => a[a.indexOf(f) + 1];
fs.copyFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), 'FAKE-sample.jtl'), get('-l'));
fs.mkdirSync(get('-o'), { recursive: true }); fs.writeFileSync(get('-j'), 'FAKE jmeter log\n');
console.log('[FAKE JMETER] args:', a.join(' '));
