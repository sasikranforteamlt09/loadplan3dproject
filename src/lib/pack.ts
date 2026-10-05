/* ===== แกนคำนวณ: การจัดวางแบบบล็อกในช่องว่างที่เหลือ (block-building) =====
   อาศัยแนวคิดบล็อกและช่องว่างที่เหลือของ Eley (2002) และ Fanslau & Bortfeldt (2010)
   แต่ใช้แบบละโมบ (greedy) บล็อกชนิดเดียว และลองหลายค่าตั้งต้น ไม่ได้ใช้การค้นหาแบบต้นไม้ของต้นฉบับ
   - รวมพัสดุชนิดเดียวกันเป็นบล็อกสี่เหลี่ยม (กว้าง x ยาว x สูง หลายชิ้น) แล้ววางลงช่องว่างทีละช่อง
   - เลือกช่องว่างที่ลึกสุด (ชิดหัวรถ) ต่ำสุด และชิดซ้ายสุดก่อน => ด้านในเต็มก่อนแล้วจึงไล่ออกมาทางประตู
   - หลังวางบล็อก แบ่งช่องที่เหลือเป็น 3 ช่องที่ไม่ทับกัน: เหนือบล็อก ข้างบล็อก และหน้าบล็อก
   เงื่อนไขที่บังคับใช้ ตรงตามหัวข้อ 1.4.3 ของปริญญานิพนธ์
     1) วางขนานแกน 2) อยู่ในขอบเขต 3) ไม่ซ้อนทับ  (เป็นจริงโดยโครงสร้างของช่องว่าง)
     4) ไม่เกินน้ำหนักบรรทุก  (นับน้ำหนักสะสมก่อนวางทุกบล็อก)
     5) ฐานรองรับ 100%  (ช่องเหนือบล็อกกว้างเท่าหน้าบนของบล็อกพอดี ช่องอื่นอยู่บนพื้นผิวเดิม)
     6) ของหนักอยู่ล่าง  (ช่องเหนือบล็อกรับได้เฉพาะพัสดุที่หนักไม่เกินพัสดุในบล็อกนั้น)
     7) ของหนักอยู่ด้านท้าย  (แบ่งโซนตามแนวลึก ของเบาโซนหัวรถ ของหนักโซนใกล้ประตู เป็นกติกาที่ผู้วิจัยออกแบบเอง
        แล้วเลือกเฉพาะแผนที่ผ่านเกณฑ์ค่าเฉลี่ยความลึกเดียวกับ verify.ts ข้อ 7 ถ้าไม่มีแผนผ่าน
        ใช้แผนสะท้อนแกนลึกแทน ข้อนี้จึงเป็นจริงจากการคัดเลือก ไม่ใช่ผลการทดลอง)
   รุ่นก่อนหน้า (ขั้นตอนวิธีจุดสุดขอบ + สะท้อนแกน) เก็บไว้ที่ exp/pack_EP_v1_ceb1e9b4.ts */

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

interface T { gi: number; name: string; l: number; w: number; h: number; kg: number; color?: string; left: number }
interface S { x: number; y: number; z: number; l: number; w: number; h: number; maxKg: number }

interface BOpt extends PackOptions { weightMode?: 'none' | 'asc' | 'band'; split?: 'front' | 'side' | 'best'; k?: number; fill?: number }

function orients(t: T, rot?: boolean): number[][] {
  const { l, w, h } = t;
  if (!rot) return [[l, w, h]];
  const all = [[l, w, h], [w, l, h], [l, h, w], [h, l, w], [w, h, l], [h, w, l]];
  const seen = new Set<string>(), out: number[][] = [];
  for (const o of all) { const k = o.join(','); if (!seen.has(k)) { seen.add(k); out.push(o); } }
  return out;
}

function packBlock(items: ItemGroup[], box: Box, opt: BOpt): PackResult {
  const EPS = 0.01, t0 = performance.now();
  const L = box.l - (opt.rearReserve || 0), W = box.w, H = box.h;
  const types: T[] = items.map((it, gi) => ({ gi, name: it.name, l: +it.l, w: +it.w, h: +it.h, kg: Math.max(0, +it.kg || 0), color: it.color, left: Math.max(0, Math.round(+it.qty) || 0) }));
  /* ขนาดที่ไม่ใช่ตัวเลขหรือไม่มากกว่า 0 วางไม่ได้ ให้ไปอยู่ในรายการวางไม่ได้ทั้งหมด */
  const bad = new Set(types.filter(t => ![t.l, t.w, t.h].every(v => Number.isFinite(v) && v > 0)));
  const kgs = [...new Set(types.map(t => t.kg))].sort((a, b) => a - b);
  /* โซนน้ำหนักตามแนวลึก (โหมด band): เรียงประเภทจากเบาไปหนัก แล้วแบ่งความยาวกองโดยประมาณตามสัดส่วนปริมาตร
     ของเบาได้โซนลึก (หัวรถ) ของหนักได้โซนใกล้ประตู => เงื่อนไข 7 */
  const totV = types.reduce((q, t) => q + t.left * t.l * t.w * t.h, 0);
  const Lest = Math.min(L, totV / (W * H * (opt.fill ?? 0.8)));
  const zone = new Map<T, [number, number]>();
  { let c = 0; for (const t of types.slice().sort((a, b) => a.kg - b.kg)) { const v = t.left * t.l * t.w * t.h; zone.set(t, [c / totV * Lest, (c + v) / totV * Lest]); c += v; } }
  let spaces: S[] = [{ x: 0, y: 0, z: 0, l: L, w: W, h: H, maxKg: Infinity }];
  const placed: Placed[] = [];
  let totalKg = 0;
  const cap = box.maxKg > 0 ? box.maxKg : Infinity;

  while (spaces.length) {
    spaces.sort((a, b) => (a.x - b.x) || (a.z - b.z) || (a.y - b.y));
    const s = spaces.shift()!;
    // ประเภทที่เลือกได้
    let pool = types.filter(t => t.left > 0 && !bad.has(t) && t.kg <= s.maxKg + EPS && totalKg + t.kg <= cap + EPS);
    if (opt.weightMode === 'asc' && pool.length) {
      // ใช้กลุ่มน้ำหนักเบาสุดที่ยังมีของและวางลงช่องนี้ได้
      for (const k of kgs) {
        const sub = pool.filter(t => Math.abs(t.kg - k) < 1e-9 && orients(t, opt.allowRotate).some(([a, b, c]) => a <= s.l + EPS && b <= s.w + EPS && c <= s.h + EPS));
        if (sub.length) { pool = sub; break; }
      }
    }
    let best: { t: T; o: number[]; nx: number; ny: number; nz: number; vol: number; score: number } | null = null;
    for (const t of pool) for (const o of orients(t, opt.allowRotate)) {
      const [a, b, c] = o;
      if (a > s.l + EPS || b > s.w + EPS || c > s.h + EPS) continue;
      const mx = Math.floor((s.l + EPS) / a), my = Math.floor((s.w + EPS) / b), mz = Math.floor((s.h + EPS) / c);
      const byKg = t.kg > 0 ? Math.floor((cap - totalKg + EPS) / t.kg) : Infinity;
      const n = Math.min(t.left, byKg);
      if (n < 1) continue;
      // สร้างบล็อกแบบกำแพง: เต็มความสูงก่อน แล้วความกว้าง แล้วค่อยลึก
      const nz = Math.min(mz, n);
      const ny = Math.min(my, Math.floor(n / nz));
      const nx = Math.min(mx, Math.floor(n / (nz * ny)));
      if (nx < 1 || ny < 1 || nz < 1) continue;
      const vol = nx * ny * nz * a * b * c;
      // คะแนน: ปริมาตรบล็อก + ความพอดีกับหน้าตัดช่อง (ลดเศษด้านกว้าง/สูง)
      const fitYZ = (ny * b * nz * c) / (s.w * s.h);
      let score = vol * (0.5 + fitYZ);
      if (opt.weightMode === 'band' && Lest > 0) {
        const [z0, z1] = zone.get(t)!;
        const d = s.x < z0 ? z0 - s.x : s.x > z1 ? s.x - z1 : 0;
        score /= 1 + (opt.k ?? 6) * d / Lest;
      }
      if (!best || score > best.score + 1e-6) best = { t, o, nx, ny, nz, vol, score };
    }
    if (!best) continue;   // ช่องนี้ใช้ไม่ได้ ทิ้ง
    const { t, o: [a, b, c], nx, ny, nz } = best;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
      placed.push({ gi: t.gi, name: t.name, l: a, w: b, h: c, kg: t.kg, color: t.color, x: s.x + i * a, y: s.y + j * b, z: s.z + k * c, seq: 0 } as Placed);
    }
    const cnt = nx * ny * nz; t.left -= cnt; totalKg += cnt * t.kg;
    const bl = nx * a, bw = ny * b, bh = nz * c;
    const add = (q: S) => { if (q.l > EPS && q.w > EPS && q.h > EPS) spaces.push(q); };
    add({ x: s.x, y: s.y, z: s.z + bh, l: bl, w: bw, h: s.h - bh, maxKg: t.kg });
    const split = opt.split || 'best';
    // ทางเลือก 1: ช่องหน้าบล็อกเต็มความกว้าง  ทางเลือก 2: ช่องข้างบล็อกเต็มความลึก
    const A1 = [{ x: s.x, y: s.y + bw, z: s.z, l: bl, w: s.w - bw, h: s.h, maxKg: s.maxKg }, { x: s.x + bl, y: s.y, z: s.z, l: s.l - bl, w: s.w, h: s.h, maxKg: s.maxKg }];
    const A2 = [{ x: s.x, y: s.y + bw, z: s.z, l: s.l, w: s.w - bw, h: s.h, maxKg: s.maxKg }, { x: s.x + bl, y: s.y, z: s.z, l: s.l - bl, w: bw, h: s.h, maxKg: s.maxKg }];
    const vmax = (A: S[]) => Math.max(...A.map(q => q.l * q.w * q.h));
    const pick = split === 'front' ? A1 : split === 'side' ? A2 : (vmax(A1) >= vmax(A2) ? A1 : A2);
    pick.forEach(add);
  }

  const usedL = placed.length ? Math.max(...placed.map(p => p.x + p.l)) : 0;
  const volItems = placed.reduce((q, p) => q + p.l * p.w * p.h, 0);
  const volUsed = usedL * W * H, volBoxZone = L * W * H, volWhole = box.l * box.w * box.h;
  const volReserve = Math.max(0, Math.min(box.l, opt.rearReserve || 0)) * W * H;
  const failed: Failed[] = [];
  (failed as any)._types = types; (failed as any)._bad = bad; (failed as any)._kg = totalKg; (failed as any)._cap = cap;
  return { placed, failed, usedL, totalKg, volItems, volUsed, volBoxZone, volWhole, volReserve,
    volFree: Math.max(0, volBoxZone - volItems), U: volUsed > 0 ? volItems / volUsed * 100 : 0,
    Uzone: volBoxZone > 0 ? volItems / volBoxZone * 100 : 0, ms: performance.now() - t0 };
}

/* ทดลองหลายค่าพารามิเตอร์ (multi-start) แล้วเลือกแผนที่ดีที่สุดที่เป็นไปตามเงื่อนไข 7
   เกณฑ์เลือก: ผ่านเงื่อนไข 7 > วางได้มากกว่า > ด้านในครึ่งแรกเต็มกว่า > กองสั้นกว่า */
function heavyRearOK(P: Placed[]): boolean {
  /* ใช้กรณีเลวร้ายสุดเมื่อน้ำหนักเท่ากัน: ในกลุ่มหนักเลือกชิ้นที่ลึกสุด ในกลุ่มเบาเลือกชิ้นที่ใกล้ประตูสุด
     ถ้ากรณีนี้ผ่าน ไม่ว่าเรียงชิ้นน้ำหนักเท่ากันแบบใดก็ผ่าน (ตรงกับเกณฑ์ใน verify.ts ข้อ 7) */
  const n = P.length; if (!n) return true;
  const q = Math.max(1, Math.floor(n / 4)), c = (p: Placed) => p.x + p.l / 2;
  const heavy = P.slice().sort((a, b) => (b.kg - a.kg) || (c(a) - c(b))).slice(0, q);
  const light = P.slice().sort((a, b) => (a.kg - b.kg) || (c(b) - c(a))).slice(0, q);
  const mid = (A: Placed[]) => A.reduce((t, p) => t + c(p), 0) / A.length;
  return mid(heavy) >= mid(light) - 0.01;
}
function innerFill(r: PackResult, W: number, H: number): number {
  const half = r.usedL / 2; if (half <= 0) return 0;
  let v = 0; for (const p of r.placed) { const b = Math.min(half, p.x + p.l); if (b > p.x) v += (b - p.x) * p.w * p.h; }
  return v / (half * W * H);
}
export function pack(items: ItemGroup[], box: Box, opt: PackOptions): PackResult {
  const t0 = performance.now();
  const tries: BOpt[] = [];
  for (const k of [6, 3, 12, 30]) for (const split of ['best', 'front', 'side'] as const) tries.push({ ...opt, weightMode: 'band', k, split });
  for (const split of ['best', 'front', 'side'] as const) tries.push({ ...opt, weightMode: 'asc', split });
  let best: PackResult | null = null, bk: number[] = [];
  const cands: PackResult[] = [];
  for (const o of tries) {
    const r = packBlock(items, box, o); cands.push(r);
    /* แผนสะท้อนแกนลึก (แบบเดียวกับระบบเดิม) เป็นตัวเลือกสำรองเมื่อแผนปกติไม่ผ่านเงื่อนไข 7 */
    if (!heavyRearOK(r.placed) && r.placed.length) {
      const m = { ...r, placed: r.placed.map(p => ({ ...p, x: r.usedL - (p.x + p.l) })) } as PackResult;
      cands.push(m);
    }
  }
  const keyOf = (r: PackResult) => [heavyRearOK(r.placed) ? 1 : 0, r.placed.length, Math.round(innerFill(r, box.w, box.h) * 1000), -Math.round(r.usedL)];
  const ranked = cands.map(r => ({ r, k: keyOf(r) })).sort((A, B) => {
    for (let i = 0; i < A.k.length; i++) if (A.k[i] !== B.k[i]) return B.k[i] - A.k[i];
    return 0;
  });
  /* ตรวจซ้ำแบบเดียวกับ verify.ts ข้อ 7 หลังเรียงลำดับการจัดวางจริงแล้ว (กรณีน้ำหนักเท่ากันหลายชิ้น
     ผลขึ้นกับลำดับ) เลือกแผนแรกที่ผ่านจริง ถ้าไม่มีเลยใช้แผนอันดับแรก */
  const exact7 = (P: Placed[]) => {
    const n = P.length; if (!n) return true;
    const s = P.slice().sort((a, b) => a.kg - b.kg), q = Math.max(1, Math.floor(n / 4));
    const mid = (A: Placed[]) => A.reduce((t, p) => t + p.x + p.l / 2, 0) / A.length;
    return mid(s.slice(-q)) >= mid(s.slice(0, q)) - 0.01;
  };
  for (const { r } of ranked.slice(0, 6)) {
    sequence(r.placed, 0.01);
    if (exact7(r.placed)) { best = r; break; }
  }
  if (!best) best = ranked[0].r;
  void bk;
  /* รายการที่วางไม่ได้ สร้างเฉพาะของแผนที่เลือก */
  { const f: any = best!.failed, out: Failed[] = [];
    for (const t of f._types as T[]) for (let k = 0; k < t.left; k++)
      out.push({ u: { gi: t.gi, name: t.name, l: t.l, w: t.w, h: t.h, kg: t.kg, color: t.color },
        why: f._bad.has(t) ? 'ขนาดไม่ถูกต้อง' : (f._kg + t.kg > f._cap + 0.01) ? 'เกินน้ำหนักบรรทุก' : 'ไม่มีพื้นที่ว่างที่วางได้' } as Failed);
    best!.failed = out; }
  /* ลำดับการจัดวางจริง: ลึกสุด ต่ำสุด ชิดซ้ายสุด โดยชิ้นที่รองรับและชิ้นที่ถูกบังต้องมาก่อน */
  sequence(best!.placed, 0.01);
  best!.ms = performance.now() - t0;
  return best!;
}
