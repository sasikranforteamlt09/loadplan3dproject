/* ===== แกนคำนวณ: ขั้นตอนวิธีจุดสุดขอบ (Extreme Point) =====
   Crainic, Perboli & Tadei (2008) — ปัญหาการบรรจุสามมิติแบบทราบข้อมูลล่วงหน้า
   เงื่อนไขที่บังคับใช้ ตรงตามหัวข้อ 1.4.3 ของปริญญานิพนธ์
     1) วางขนานแกน   2) อยู่ในขอบเขต   3) ไม่ซ้อนทับ
     4) ไม่เกินน้ำหนักบรรทุก   5) ฐานรองรับ 100%   6) ของหนักอยู่ล่าง
   (ตัดเงื่อนไขเดิมข้อ "ของหนักอยู่ท้ายกอง" และการสะท้อนแกนออก เพราะเป็นแนวปฏิบัติของสถานที่เดิม
    ลำดับการวางจึงเป็นชิ้นใหญ่ก่อน วางลึกสุดก่อน ตรงกับที่สังเกตหน้างาน)
   ขั้นตอน: เรียงพัสดุจากปริมาตรมากไปน้อย (ถ้าเท่ากันเรียงน้ำหนักมากก่อน) แล้ววางทีละชิ้น
   ที่จุดสุดขอบจุดแรกที่ใส่ได้ โดยเรียงจุดจากลึกสุด ต่ำสุด ชิดซ้ายสุดก่อน */

/** กลุ่มขนาดพัสดุที่ผู้ใช้กรอก */
export interface ItemGroup {
  name: string;
  l: number; w: number; h: number;
  kg: number;
  qty: number;
  color?: string;
}

/** ขนาดภายในตู้ */
export interface Box {
  l: number; w: number; h: number;
  maxKg: number;
}

export interface PackOptions {
  allowRotate?: boolean;
  rearReserve?: number;
}

/** พัสดุหนึ่งชิ้นหลังกระจายจำนวนออกจากกลุ่ม */
interface Unit {
  gi: number;
  name: string;
  l: number; w: number; h: number;
  kg: number;
  color?: string;
}

/** พัสดุที่วางแล้ว พร้อมพิกัดและลำดับ */
export interface Placed extends Unit {
  x: number; y: number; z: number;
  seq: number;
}

interface Cand { x: number; y: number; z: number; l: number; w: number; h: number }

export interface Failed { u: Unit; why: string }

export interface PackResult {
  placed: Placed[];
  failed: Failed[];
  usedL: number;
  totalKg: number;
  volItems: number;
  volUsed: number;
  volBoxZone: number;
  volWhole: number;
  volReserve: number;
  volFree: number;
  U: number;
  Uzone: number;
  ms: number;
}

function orientations(it: { l: number; w: number; h: number }, allowRotate?: boolean): number[][] {
  const [l, w, h] = [it.l, it.w, it.h];
  if (!allowRotate) return [[l, w, h]];
  const all = [[l, w, h], [l, h, w], [w, l, h], [w, h, l], [h, l, w], [h, w, l]];
  const seen = new Set<string>(), out: number[][] = [];
  for (const o of all) { const k = o.join(','); if (!seen.has(k)) { seen.add(k); out.push(o); } }
  return out;
}

function overlap(a: Cand, b: Cand): boolean {
  return a.x < b.x + b.l && b.x < a.x + a.l &&
         a.y < b.y + b.w && b.y < a.y + a.w &&
         a.z < b.z + b.h && b.z < a.z + a.h;
}

/* พื้นที่ฐานที่ได้รับการรองรับ และรายการชิ้นที่รองรับอยู่ */
function support(cand: Cand, placed: Placed[], EPS: number): { ratio: number; under: Placed[] } {
  if (cand.z <= EPS) return { ratio: 1, under: [] };
  const need = cand.l * cand.w;
  let got = 0; const under: Placed[] = [];
  for (const p of placed) {
    if (Math.abs(p.z + p.h - cand.z) > EPS) continue;
    const ox = Math.min(cand.x + cand.l, p.x + p.l) - Math.max(cand.x, p.x);
    const oy = Math.min(cand.y + cand.w, p.y + p.w) - Math.max(cand.y, p.y);
    if (ox > EPS && oy > EPS) { got += ox * oy; under.push(p); }
  }
  return { ratio: got / need, under };
}

/* เรียงลำดับการวางแบบพึ่งพา: ชิ้นที่รองรับและชิ้นที่ถูกบังต้องมาก่อน */
export function sequence(placed: Placed[], EPS: number): void {
  const n = placed.length;
  const pref = (a: Placed, b: Placed) => (a.x - b.x) || (a.z - b.z) || (a.y - b.y);
  const ovY = (a: Placed, b: Placed) => a.y < b.y + b.w - EPS && b.y < a.y + a.w - EPS;
  const ovZ = (a: Placed, b: Placed) => a.z < b.z + b.h - EPS && b.z < a.z + a.h - EPS;
  const ovX = (a: Placed, b: Placed) => a.x < b.x + b.l - EPS && b.x < a.x + a.l - EPS;
  function order(withBlock: boolean): Placed[] | null {
    const before: number[][] = placed.map(() => []);      // before[j] = ชิ้นที่ต้องวางก่อน j
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      if (i === j) continue;
      const a = placed[i], b = placed[j];
      const sup = Math.abs(a.z + a.h - b.z) <= EPS && b.z > EPS && ovX(a, b) && ovY(a, b);  // a รองรับ b
      const blk = withBlock && b.x >= a.x + a.l - EPS && ovY(a, b) && ovZ(a, b);           // b บังทางเข้าของ a
      if (sup || blk) before[j].push(i);
    }
    const need = before.map(x => x.length), after: number[][] = placed.map(() => []);
    before.forEach((lst, j) => lst.forEach(i => after[i].push(j)));
    const ready: number[] = [], out: Placed[] = [];
    for (let j = 0; j < n; j++) if (!need[j]) ready.push(j);
    while (ready.length) {
      let k = 0;
      for (let t = 1; t < ready.length; t++) if (pref(placed[ready[t]], placed[ready[k]]) < 0) k = t;
      const j = ready.splice(k, 1)[0]; out.push(placed[j]);
      for (const m of after[j]) if (--need[m] === 0) ready.push(m);
    }
    return out.length === n ? out : null;             // null = มีวงวน
  }
  const out = order(true) || order(false) || placed.slice().sort(pref);
  out.forEach((p, i) => { placed[i] = p; p.seq = i + 1; });
}

export function pack(items: ItemGroup[], box: Box, opt: PackOptions): PackResult {
  const EPS = 0.01;
  const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const L = box.l - Math.max(0, +(opt.rearReserve || 0) || 0);   // โซนท้ายรถกันไว้ให้ถุงกระสอบ
  const W = box.w, H = box.h;

  // กระจายจำนวนออกเป็นรายชิ้น แล้วเรียงชิ้นใหญ่ก่อน (ปริมาตรมาก → น้อย ถ้าเท่ากันน้ำหนักมากก่อน)
  const units: Unit[] = [], badUnits: Unit[] = [];
  items.forEach((it, gi) => {
    const n = Math.min(100000, Math.max(0, Math.round(+it.qty) || 0));
    const dimsOk = [+it.l, +it.w, +it.h].every(v => Number.isFinite(v) && v > 0);
    for (let k = 0; k < n; k++) {
      const u: Unit = { gi, name: it.name, l: +it.l, w: +it.w, h: +it.h, kg: Math.max(0, +it.kg || 0), color: it.color };
      (dimsOk ? units : badUnits).push(u);
    }
  });
  units.sort((a, b) => (b.l * b.w * b.h - a.l * a.w * a.h) || (b.kg - a.kg));

  const placed: Placed[] = [], failed: Failed[] = badUnits.map(u => ({ u, why: 'ขนาดไม่ถูกต้อง' }));
  let pts: { x: number; y: number; z: number }[] = [{ x: 0, y: 0, z: 0 }];
  let totalKg = 0;

  const key = (p: { x: number; y: number; z: number }) =>
    p.x.toFixed(1) + '|' + p.y.toFixed(1) + '|' + p.z.toFixed(1);

  /* พัสดุที่ขนาดและน้ำหนักเท่ากับชิ้นที่วางไม่ได้มาก่อน ถือว่าวางไม่ได้เช่นกัน (ลดเวลาเมื่อของล้นตู้) */
  const failedSig = new Set<string>();
  for (const u of units) {
    const sig = u.l + '|' + u.w + '|' + u.h + '|' + u.kg;
    if (failedSig.has(sig)) { failed.push({ u, why: 'ไม่มีพื้นที่ว่างที่วางได้' }); continue; }
    if (box.maxKg > 0 && totalKg + u.kg > box.maxKg) { failed.push({ u, why: 'เกินน้ำหนักบรรทุก' }); continue; }

    pts.sort((a, b) => (a.x - b.x) || (a.z - b.z) || (a.y - b.y));
    let best: Cand | null = null;

    outer:
    for (const p of pts) {
      for (const [ol, ow, oh] of orientations(u, opt.allowRotate)) {
        if (p.x + ol > L + EPS || p.y + ow > W + EPS || p.z + oh > H + EPS) continue;
        const cand: Cand = { x: p.x, y: p.y, z: p.z, l: ol, w: ow, h: oh };
        let hit = false;
        for (const q of placed) if (overlap(cand, q)) { hit = true; break; }
        if (hit) continue;
        const sup = support(cand, placed, EPS);
        if (sup.ratio < 0.999) continue;                       // เงื่อนไข 5
        let bad = false;
        for (const s of sup.under) if (s.kg + EPS < u.kg) { bad = true; break; }
        if (bad) continue;                                     // เงื่อนไข 6
        best = cand; break outer;
      }
    }

    if (!best) { failedSig.add(sig); failed.push({ u, why: 'ไม่มีพื้นที่ว่างที่วางได้' }); continue; }

    const item = Object.assign({}, u, best, { seq: placed.length + 1 }) as Placed;
    placed.push(item);
    totalKg += u.kg;

    const seen = new Set(pts.map(key));
    for (const np of [{ x: best.x + best.l, y: best.y, z: best.z },
                      { x: best.x, y: best.y + best.w, z: best.z },
                      { x: best.x, y: best.y, z: best.z + best.h }]) {
      if (np.x < L - EPS && np.y < W - EPS && np.z < H - EPS && !seen.has(key(np))) {
        seen.add(key(np)); pts.push(np);
      }
    }
    pts = pts.filter(p => {
      for (const q of placed) {
        if (p.x > q.x - EPS && p.x < q.x + q.l - EPS &&
            p.y > q.y - EPS && p.y < q.y + q.w - EPS &&
            p.z > q.z - EPS && p.z < q.z + q.h - EPS) return false;
      }
      return true;
    });
  }

  const usedL = placed.length ? Math.max(...placed.map(p => p.x + p.l)) : 0;

  /* ลำดับการจัดวางจริง 
     x = 0 คือผนังหน้าตู้ (ฝั่งหัวรถ) ผู้ปฏิบัติงานวางจากผนังหน้าไล่ออกมาทางประตูท้าย
     เกณฑ์ที่ต้องการ: ลึกสุด (x น้อย) → ต่ำสุด (z น้อย) → ชิดซ้ายสุด (y น้อย)
     แต่ห้ามชิ้นใดมาก่อน (ก) ชิ้นที่รองรับฐานของตนทุกชิ้น และ
     (ข) ชิ้นที่อยู่ลึกกว่าและถูกชิ้นนี้บังทางเข้าจากประตู (ภาพฉายด้านข้าง y-z ทับกัน)
     จึงใช้การเรียงแบบพึ่งพา (topological sort) ที่เลือกชิ้นตามเกณฑ์ข้างต้นเมื่อมีหลายชิ้นพร้อมวาง */
  sequence(placed, EPS);
  const volItems = placed.reduce((s, p) => s + p.l * p.w * p.h, 0);
  const volUsed = usedL * W * H;
  const volBoxZone = L * W * H;
  const volWhole = box.l * box.w * box.h;
  const volReserve = Math.max(0, Math.min(box.l, opt.rearReserve || 0)) * W * H;   // โซนท้ายรถที่กันไว้
  const volFree = Math.max(0, volBoxZone - volItems);   // ปริมาตรว่างคงเหลือ (ไม่รวมโซนที่กันไว้)

  return {
    placed, failed, usedL, totalKg,
    volItems, volUsed, volBoxZone, volWhole, volReserve, volFree,
    U: volUsed > 0 ? (volItems / volUsed) * 100 : 0,          // นิยามตามหัวข้อ 1.6 ของเล่ม
    Uzone: volBoxZone > 0 ? (volItems / volBoxZone) * 100 : 0,
    ms: (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0,
  };
}
