// Kiểm thử jtl-summary.mjs bằng DỮ LIỆU GIẢ (FAKE-sample.jtl). Chỉ để kiểm tra script, không phải kết quả chạy SUT.
// Chạy: node --test scripts/test/jtl-summary.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSamples, summarize, percentile, parseCsv } from '../jtl-summary.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const { samples, badLines } = readSamples(fs.readFileSync(path.join(here, 'FAKE-sample.jtl'), 'utf8'));

test('đọc đủ 6 mẫu, kể cả failureMessage nhiều dòng có dấu phẩy và nháy kép', () => {
  assert.equal(samples.length, 6);
  assert.equal(badLines.length, 0);
  assert.match(samples[3].failureMessage, /"quoted"/);
  assert.equal(samples[3].success, false);
});

test('phân vị nearest-rank', () => {
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 95), 10);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 90), 9);
  assert.equal(percentile([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 50), 5);
  assert.equal(percentile([], 95), null);
});

test('tổng: lỗi %, avg, throughput theo kiểu JMeter', () => {
  const r = summarize(samples, { bucket: 10 });
  assert.equal(r.total.samples, 6);
  assert.equal(r.total.errors, 1);
  assert.equal(r.total.errorPct, 16.7);
  assert.equal(r.total.avg, 341.7); // (100+200+300+400+1000+50)/6
  assert.equal(r.total.max, 1000);
  // khoảng thời gian: 1000000 → 1012050 = 12.05 s; 6/12.05 = 0.498
  assert.equal(r.total.throughput, 0.5);
});

test('nhóm và label; p95 chỉ mẫu OK khác p95 mọi mẫu', () => {
  const r = summarize(samples, { bucket: 10 });
  assert.deepEqual(Object.keys(r.groups), ['AUTH', 'READ', 'TXN']);
  assert.equal(r.labels['READ list'].samples, 3);
  assert.equal(r.labels['READ list'].p95, 400);
  assert.equal(r.labels['READ list'].p95_ok, 300);
  assert.deepEqual(r.labels['READ list'].codes, { 200: 2, 500: 1 });
  assert.equal(r.groups.AUTH.samples, 2);
});

test('cửa sổ thời gian và chuỗi thời gian', () => {
  const r = summarize(samples, { bucket: 10, fromSec: 10 });
  assert.equal(r.total.samples, 2);
  const s = summarize(samples, { bucket: 10, p95Limit: 500, errLimit: 1 });
  assert.equal(s.series.length, 2);
  assert.equal(s.series[0].samples, 4);
  assert.equal(s.stability.firstBreach.fromSec, 0); // cửa sổ đầu có lỗi 25%
  assert.equal(s.stability.firstBreach.errorPct, 25);
});

test('CSV không có header vẫn đọc theo thứ tự mặc định', () => {
  const t = '1000,10,READ x,200,OK,t,text,true,,1,1,1,1,u,9,0,0\n';
  assert.equal(readSamples(t).samples[0].elapsed, 10);
  assert.equal(parseCsv('a,"b,c"\n').at(0)[1], 'b,c');
});
