#!/usr/bin/env node
// Chèn một hàng mới vào bảng trong HW05/audit/AI_LOG.md.
// Dùng:
//   node append-ai-log.mjs --prompt-file P.txt --output-file O.txt [--model "Opus 5.5"] [--time HH:MM] [--log path]
// - Prompt / Output: chép nguyên văn từ file, chỉ escape cho bảng Markdown
//   (| -> \|, xuống dòng -> <br>, & < > -> entity) để hàng không vỡ.
// - Cột Verdict để trống.
// - # = số lớn nhất hiện có + 1; Giờ = giờ hiện tại UTC+07:00 (HH:MM),
//   kèm "(model)" nếu truyền --model (theo quy ước hàng 3).
// - Hàng được chèn ngay sau hàng cuối của bảng, không phải cuối file.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = {};
for (let i = 0; i < args.length; i += 2) {
  if (!args[i].startsWith('--') || args[i + 1] === undefined) {
    console.error(`Tham số không hợp lệ: ${args[i]}`);
    process.exit(2);
  }
  opt[args[i].slice(2)] = args[i + 1];
}
if (!opt['prompt-file'] || !opt['output-file']) {
  console.error('Thiếu --prompt-file hoặc --output-file');
  process.exit(2);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const logPath = opt.log ?? path.resolve(here, '..', 'audit', 'AI_LOG.md');

const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n?/g, '\n').replace(/^\n+|\n+$/g, '');
const cell = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\|/g, '\\|')
    .replace(/\t/g, '&nbsp;&nbsp;')
    .replace(/\n/g, '<br>');

const prompt = read(opt['prompt-file']);
const output = read(opt['output-file']);
if (!prompt) { console.error('Prompt rỗng'); process.exit(2); }

const time =
  opt.time ??
  new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date());
const timeCell = opt.model ? `${time} (${opt.model})` : time;

const raw = fs.readFileSync(logPath, 'utf8');
const eol = raw.includes('\r\n') ? '\r\n' : '\n';
const lines = raw.split(/\r?\n/);

const header = lines.findIndex((l) => /^\|\s*#\s*\|\s*Giờ\s*\|/.test(l));
if (header < 0) { console.error('Không tìm thấy header bảng "| # | Giờ |"'); process.exit(1); }
let last = header + 1; // dòng phân cách |---|
while (last + 1 < lines.length && lines[last + 1].startsWith('|')) last++;

let maxNo = 0;
for (let i = header + 2; i <= last; i++) {
  const m = lines[i].match(/^\|\s*(\d+)\s*\|/);
  if (m) maxNo = Math.max(maxNo, Number(m[1]));
}
const no = maxNo + 1;

const row = `| ${no} | ${timeCell} | ${cell(prompt)} | ${cell(output)} |  |`;
lines.splice(last + 1, 0, row);
fs.writeFileSync(logPath, lines.join(eol), 'utf8');
console.log(`Đã thêm hàng #${no} (${timeCell}) vào ${logPath}`);
