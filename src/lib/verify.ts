/* ===== โปรแกรมตรวจสอบอิสระ =====
   ตรวจแผนการจัดวางที่ได้จาก pack.ts ว่าเป็นไปตามเงื่อนไขทั้ง 6 ข้อจริงหรือไม่

   หลักการสำคัญ: ไฟล์นี้เขียนขึ้นใหม่ทั้งหมดจากนิยามเงื่อนไขในปริญญานิพนธ์
   ไม่เรียกใช้ฟังก์ชันใด ๆ จาก pack.ts และไม่ใช้ค่าที่ pack.ts คำนวณไว้
   รับเข้ามาเพียงพิกัดสุดท้าย (x, y, z, l, w, h, kg, seq) แล้วคำนวณซ้ำเองทุกอย่าง
   เพื่อให้เป็นการตรวจสอบโดยอิสระ ไม่ใช่การให้โปรแกรมตรวจตัวเอง */

import type { Placed, Box } from './pack';

export interface CheckResult {
  no: number;
  name: string;
  checked: number;      // จำนวนรายการที่ตรวจ
  violations: number;   // จำนวนที่ละเมิด
  detail: string;       // คำอธิบายผล
  pass: boolean;
  /** true = รายการนี้ไม่ได้ถูกตรวจ เพราะข้อมูลไม่พอ ไม่ใช่การรับรองว่าถูกต้อง */
  skipped?: boolean;
}

export interface VerifyReport {
  results: CheckResult[];
  allPass: boolean;
  items: number;
  ms: number;
}

const EPS = 0.01;

/** ปริมาตรซ้อนทับกันของกล่องสองใบ (ลบ.ซม.) */
function overlapVol(a: Placed, b: Placed): number {
  const dx = Math.min(a.x + a.l, b.x + b.l) - Math.max(a.x, b.x);
  const dy = Math.min(a.y + a.w, b.y + b.w) - Math.max(a.y, b.y);
  const dz = Math.min(a.z + a.h, b.z + b.h) - Math.max(a.z, b.z);
  return dx > EPS && dy > EPS && dz > EPS ? dx * dy * dz : 0;
}

/** กล่องที่รองรับฐานของ p (ผิวบนแตะฐานล่างของ p พอดี) พร้อมพื้นที่สัมผัสรวม */
function supporters(p: Placed, all: Placed[]): { under: Placed[]; area: number } {
  const under: Placed[] = [];
  let area = 0;
  for (const q of all) {
    if (q === p) continue;
    if (Math.abs(q.z + q.h - p.z) > EPS) continue;
    const ox = Math.min(p.x + p.l, q.x + q.l) - Math.max(p.x, q.x);
    const oy = Math.min(p.y + p.w, q.y + q.w) - Math.max(p.y, q.y);
    if (ox > EPS && oy > EPS) { under.push(q); area += ox * oy; }
  }
  return { under, area };
}

export function verify(placed: Placed[], box: Box, rearReserve = 0): VerifyReport {
  const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
  const n = placed.length;
  const results: CheckResult[] = [];
  const zone = { l: box.l - (rearReserve || 0), w: box.w, h: box.h };

  /* --- 1) วางขนานแกน --- */
  {
    let bad = 0;
    for (const p of placed) {
      const vals = [p.x, p.y, p.z, p.l, p.w, p.h];
      if (vals.some(v => !isFinite(v)) || p.l <= 0 || p.w <= 0 || p.h <= 0 || !isFinite(p.kg) || p.kg < 0) bad++;
    }
    results.push({
      no: 1, name: 'วางขนานแกนตู้ ไม่วางเอียง', checked: n, violations: bad,
      detail: 'เป็นจริงโดยโครงสร้างข้อมูล เพราะไม่มีตัวแปรมุมหมุน ตรวจได้เพียงความสมบูรณ์ของพิกัดและขนาด',
      pass: bad === 0, skipped: true,
    });
  }

  /* --- 2) อยู่ในขอบเขตพื้นที่บรรทุก --- */
  {
    let bad = 0;
    for (const p of placed) {
      if (p.x < -EPS || p.y < -EPS || p.z < -EPS) { bad++; continue; }
      if (p.x + p.l > zone.l + EPS || p.y + p.w > zone.w + EPS || p.z + p.h > zone.h + EPS) bad++;
    }
    results.push({
      no: 2, name: 'อยู่ในขอบเขตพื้นที่บรรทุก', checked: n, violations: bad,
      detail: `ตรวจกับพื้นที่ ${zone.l} x ${zone.w} x ${zone.h} ซม.`, pass: bad === 0,
    });
  }

  /* --- 3) ไม่ซ้อนทับกัน (ตรวจทุกคู่ที่ช่วงความลึกคาบเกี่ยวกัน) --- */
  {
    const idx = placed.map((_, i) => i).sort((a, b) => placed[a].x - placed[b].x);
    let pairs = 0, bad = 0;
    for (let i = 0; i < idx.length; i++) {
      const a = placed[idx[i]];
      for (let j = i + 1; j < idx.length; j++) {
        const b = placed[idx[j]];
        if (b.x >= a.x + a.l - EPS) break;      // เลยช่วงความลึกของ a แล้ว
        pairs++;
        if (overlapVol(a, b) > 0) bad++;
      }
    }
    results.push({
      no: 3, name: 'ไม่ซ้อนทับกัน', checked: pairs, violations: bad,
      detail: `ตรวจคู่ที่ช่วงความลึกคาบเกี่ยวกัน ${pairs.toLocaleString('th-TH')} คู่`, pass: bad === 0,
    });
  }

  /* --- 4) ไม่เกินน้ำหนักบรรทุก --- */
  {
    const total = placed.reduce((s, p) => s + (p.kg || 0), 0);
    const has = box.maxKg > 0;
    const over = has && total > box.maxKg + EPS;
    results.push({
      no: 4, name: 'ไม่เกินน้ำหนักบรรทุกของรถ', checked: has ? 1 : 0, violations: over ? 1 : 0,
      detail: has
        ? `น้ำหนักรวม ${total.toFixed(1)} กก. จากพิกัด ${box.maxKg} กก.`
        : `ไม่ได้กำหนดพิกัดน้ำหนักบรรทุก จึงตรวจข้อนี้ไม่ได้ · น้ำหนักรวมที่คำนวณได้ ${total.toFixed(1)} กก.`,
      pass: !over, skipped: !has,
    });
  }

  /* --- 5) ฐานรองรับครบ 100% --- */
  {
    let bad = 0, onFloor = 0;
    for (const p of placed) {
      if (p.z < EPS) { onFloor++; continue; }         // วางบนพื้นตู้
      const { area } = supporters(p, placed);
      if (area < p.l * p.w * 0.999) bad++;
    }
    results.push({
      no: 5, name: 'ฐานรองรับครบ 100%', checked: n, violations: bad,
      detail: `วางบนพื้นตู้ ${onFloor} ชิ้น · วางซ้อนบนกล่องอื่น ${n - onFloor} ชิ้น`, pass: bad === 0,
    });
  }

  /* --- 6) ไม่มีของหนักวางทับของที่เบากว่า --- */
  {
    let bad = 0, stacked = 0;
    for (const p of placed) {
      if (p.z < EPS) continue;
      const { under } = supporters(p, placed);
      stacked += under.length;
      for (const u of under) if ((u.kg || 0) + EPS < (p.kg || 0)) { bad++; break; }
    }
    results.push({
      no: 6, name: 'ไม่มีของหนักวางทับของที่เบากว่า', checked: stacked, violations: bad,
      detail: `ตรวจความสัมพันธ์การวางซ้อน ${stacked.toLocaleString('th-TH')} ความสัมพันธ์`, pass: bad === 0,
    });
  }


  /* --- 7) ลำดับการจัดวางทำตามได้จริง --- */
  {
    let bad = 0, rel = 0;
    const bySeq = placed.slice().sort((a, b) => a.seq - b.seq);
    const seqOf = new Map<Placed, number>();
    bySeq.forEach((p, i) => seqOf.set(p, i));
    for (const p of placed) {
      if (p.z < EPS) continue;
      const { under } = supporters(p, placed);
      for (const u of under) { rel++; if ((seqOf.get(u) ?? 0) > (seqOf.get(p) ?? 0)) { bad++; } }
    }
    results.push({
      no: 7, name: 'ลำดับการวางทำตามได้จริง (ของล่างต้องวางก่อน)', checked: rel, violations: bad,
      detail: `ตรวจว่าทุกชิ้นถูกวางหลังกล่องที่รองรับฐานของตน ${rel.toLocaleString('th-TH')} ความสัมพันธ์ · ` +
              'ไม่ได้ตรวจว่ามีทางเคลื่อนพัสดุเข้าไปวางได้จริง',
      pass: bad === 0,
    });
  }

  const ms = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
  /* allPass หมายถึง ไม่พบการละเมิดในรายการที่ตรวจได้จริงเท่านั้น
     รายการที่ skipped = true คือรายการที่ตรวจไม่ได้ ไม่ใช่การรับรองว่าถูกต้อง */
  return { results, allPass: results.every(r => r.pass), items: n, ms };
}
