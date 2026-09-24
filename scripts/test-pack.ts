/* ชุดทดสอบค่าคงที่ของแกนคำนวณ (ดัดแปลงจาก /tmp/lp/test.js ของรุ่นวานิลลา)
   ทดสอบ 29 ชุดข้อมูล ตรวจเงื่อนไขทั้งหมดในหัวข้อ 1.4.3 ต้องได้ 0 ทุกรายการ
   รัน: npm test                                                              */
import { pack, type ItemGroup, type Box, type PackOptions, type PackResult } from '../src/lib/pack';

const EPS = 0.01;
function rng(seed: number) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

const SAMPLE: ItemGroup[] = [
  { name: 'A', l: 14, w: 20, h: 6, kg: 1.2, qty: 40 }, { name: 'B', l: 17, w: 25, h: 9, kg: 2, qty: 35 },
  { name: 'C', l: 20, w: 30, h: 11, kg: 3.5, qty: 30 }, { name: 'D', l: 22, w: 35, h: 14, kg: 5, qty: 25 },
  { name: 'E', l: 24, w: 40, h: 17, kg: 8, qty: 15 }, { name: 'Big', l: 40, w: 60, h: 40, kg: 18, qty: 6 }];
const BOX: Box = { l: 300, w: 170, h: 180, maxKg: 0 };

function randData(r: () => number, target: number): ItemGroup[] {
  const g = 3 + Math.floor(r() * 6); const items: ItemGroup[] = []; let n = 0;
  for (let i = 0; i < g; i++) {
    items.push({ name: 'G' + i, l: 10 + Math.round(r() * 40), w: 10 + Math.round(r() * 40), h: 5 + Math.round(r() * 35), kg: +(0.5 + r() * 20).toFixed(1), qty: 1 });
  }
  while (n < target) { items[Math.floor(r() * g)].qty++; n++; }
  items.forEach(i => i.qty--);
  return items;
}

type Counts = { overlap: number; bounds: number; support: number; heavyOnLight: number; weight: number; seqSupport: number; seqBlock: number };

function check(res: PackResult, box: Box, opt: PackOptions): Counts {
  const P = res.placed, L = box.l - (opt.rearReserve || 0);
  const c: Counts = { overlap: 0, bounds: 0, support: 0, heavyOnLight: 0, weight: 0, seqSupport: 0, seqBlock: 0 };
  const pos = new Map(P.map((p, i) => [p, i]));
  for (let i = 0; i < P.length; i++) {
    const a = P[i];
    if (a.x < -EPS || a.y < -EPS || a.z < -EPS || a.x + a.l > L + EPS || a.y + a.w > box.w + EPS || a.z + a.h > box.h + EPS) c.bounds++;
    let area = 0;
    for (let j = 0; j < P.length; j++) {
      if (i === j) continue; const b = P[j];
      if (j > i && a.x < b.x + b.l - EPS && b.x < a.x + a.l - EPS && a.y < b.y + b.w - EPS && b.y < a.y + a.w - EPS && a.z < b.z + b.h - EPS && b.z < a.z + a.h - EPS) c.overlap++;
      if (a.z > EPS && Math.abs(b.z + b.h - a.z) <= EPS) {
        const ox = Math.min(a.x + a.l, b.x + b.l) - Math.max(a.x, b.x), oy = Math.min(a.y + a.w, b.y + b.w) - Math.max(a.y, b.y);
        if (ox > EPS && oy > EPS) { area += ox * oy; if (b.kg + EPS < a.kg) c.heavyOnLight++; if (pos.get(b)! > i) c.seqSupport++; }
      }
      // ชิ้นที่อยู่ด้านประตู (x มากกว่า) และบังชิ้นที่ลึกกว่า ต้องไม่ถูกวางก่อน
      if (j < i && b.x >= a.x + a.l - EPS && a.y < b.y + b.w - EPS && b.y < a.y + a.w - EPS && a.z < b.z + b.h - EPS && b.z < a.z + a.h - EPS) c.seqBlock++;
    }
    if (a.z > EPS && area < a.l * a.w * 0.999) c.support++;
  }
  if (box.maxKg > 0 && res.totalKg > box.maxKg + EPS) c.weight++;
  return c;
}

const cases: { name: string; items: ItemGroup[]; box: Box; opt: PackOptions }[] = [];
cases.push({ name: 'sample', items: SAMPLE, box: BOX, opt: { allowRotate: true, rearReserve: 0 } });
cases.push({ name: 'sample+rev80', items: SAMPLE, box: BOX, opt: { allowRotate: true, rearReserve: 80 } });
cases.push({ name: 'sample norot', items: SAMPLE, box: BOX, opt: { allowRotate: false, rearReserve: 0 } });
cases.push({ name: 'sample x4', items: SAMPLE.map(s => ({ ...s, qty: s.qty * 4 })), box: BOX, opt: { allowRotate: true, rearReserve: 0 } });
cases.push({ name: 'sample 300kg', items: SAMPLE, box: { ...BOX, maxKg: 300 }, opt: { allowRotate: true, rearReserve: 0 } });
const r = rng(12345);
for (let k = 0; k < 24; k++) {
  const n = 150 + Math.floor(r() * 451);
  const rot = k % 2 === 0, rev = (k % 3 === 0) ? Math.round(20 + r() * 80) : 0, mkg = (k % 4 === 1) ? Math.round(300 + r() * 700) : 0;
  cases.push({ name: `rand${k} n~${n}${rot ? ' rot' : ''}${rev ? ' rev' + rev : ''}${mkg ? ' kg' + mkg : ''}`, items: randData(r, n), box: { ...BOX, maxKg: mkg }, opt: { allowRotate: rot, rearReserve: rev } });
}

const tot: Counts = { overlap: 0, bounds: 0, support: 0, heavyOnLight: 0, weight: 0, seqSupport: 0, seqBlock: 0 };
let casesBad = 0, placedTot = 0;
const rows: string[] = [];
for (const cs of cases) {
  const res = pack(cs.items, cs.box, cs.opt); const c = check(res, cs.box, cs.opt);
  placedTot += res.placed.length;
  let bad = false;
  for (const k of Object.keys(c) as (keyof Counts)[]) { tot[k] += c[k]; if (c[k]) bad = true; }
  if (bad) casesBad++;
  rows.push(`${cs.name.padEnd(34)} placed=${String(res.placed.length).padStart(4)} failed=${String(res.failed.length).padStart(4)} U=${res.U.toFixed(1)} ms=${res.ms.toFixed(0)} ${JSON.stringify(c)}`);
  if (cs.name === 'sample') { const i34 = res.placed[33]; console.log('sample #34:', i34.name, 'x', i34.x, 'z', i34.z); }
}
console.log(rows.join('\n'));
console.log('CASES', cases.length, 'bad cases', casesBad, 'placed total', placedTot);
console.log('TOTAL', JSON.stringify(tot));
const fail = Object.values(tot).some(v => v > 0);
if (fail) { console.error('ทดสอบไม่ผ่าน: พบการละเมิดเงื่อนไข'); process.exit(1); }
console.log('ทดสอบผ่าน: ไม่พบการละเมิดเงื่อนไขใด ๆ (0 ทุกรายการ)');
