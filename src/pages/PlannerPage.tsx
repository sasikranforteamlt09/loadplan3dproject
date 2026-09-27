import { useMemo, useRef, useState, useEffect } from 'react';
import { AppHeader } from '../components/Layout';
import Stepper from '../components/Stepper';
import BottomNav from '../components/BottomNav';
import Step1Truck from '../components/Step1Truck';
import Step2Items from '../components/Step2Items';
import Step3Result from '../components/Step3Result';
import { pack, type Box, type ItemGroup, type PackResult } from '../lib/pack';
import { PALETTE, TRUCKS } from '../config';

export interface GroupRow {
  id: number;
  name: string;
  l: string; w: string; h: string; kg: string; qty: string;
  color: string;
  /** รูปทรงของพัสดุ ใช้เพื่อการแสดงผลและวิธีกรอกเท่านั้น
      ทรงกระบอกจะถูกแปลงเป็นกล่องครอบเล็กที่สุดก่อนเข้าการคำนวณ ตามหัวข้อ 2.4.3 ของเล่ม */
  shape?: 'box' | 'cyl';
}

export interface Plan extends PackResult { box: Box; reserve: number }

let nextId = 1;
export function makeRow(v: Partial<Omit<GroupRow, 'id' | 'color'>>, index: number): GroupRow {
  return {
    id: nextId++,
    name: v.name ?? 'กลุ่ม ' + (index + 1),
    l: v.l ?? '', w: v.w ?? '', h: v.h ?? '', kg: v.kg ?? '', qty: v.qty ?? '0',
    color: PALETTE[index % PALETTE.length],
    shape: v.shape ?? 'box',
  };
}

const INITIAL: GroupRow[] = [
  { name: 'กลุ่ม A', l: '14', w: '20', h: '6', kg: '1.2', qty: '0' },
  { name: 'กลุ่ม B', l: '17', w: '25', h: '9', kg: '2', qty: '0' },
  { name: 'กลุ่ม C', l: '20', w: '30', h: '11', kg: '3.5', qty: '0' },
].map(makeRow);

/* ชุดข้อมูลสำหรับลองใช้งานเท่านั้น ห้ามนำตัวเลขไปใส่ในเล่ม
   อ้างอิงลักษณะพัสดุจากข้อมูลภาคสนาม: ส่วนใหญ่เป็นกล่องเล็ก จำนวนมาก
   กล่องใหญ่มีน้อย และน้ำหนักไม่แปรผันตามขนาด กล่องเล็กอาจหนักกว่ากล่องใหญ่
   พัสดุต่ำกว่า 1 กก. อยู่ในกระสอบ จึงไม่อยู่ในชุดข้อมูลนี้ */
export const DEMO_ROWS: Omit<GroupRow, 'id' | 'color'>[] = [
  { name: 'เบอร์ 00 เล็กมาก', l: '14', w: '9.8', h: '6',  kg: '1.1', qty: '180' },
  { name: 'เบอร์ A เล็ก',     l: '20', w: '14',  h: '6',  kg: '2.8', qty: '150' },
  { name: 'เบอร์ B เล็ก',     l: '25', w: '17',  h: '9',  kg: '1.4', qty: '120' },
  { name: 'เบอร์ C กลาง',     l: '30', w: '20',  h: '11', kg: '6.2', qty: '90'  },
  { name: 'เบอร์ D กลาง',     l: '35', w: '22',  h: '14', kg: '2.5', qty: '60'  },
  { name: 'เบอร์ E ใหญ่',     l: '40', w: '24',  h: '17', kg: '9.5', qty: '30'  },
  { name: 'เบอร์ F ใหญ่',     l: '45', w: '30',  h: '20', kg: '4',   qty: '12'  },
];

export default function PlannerPage() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);
  const [truck, setTruck] = useState('t4');
  const [dims, setDims] = useState({ l: '300', w: '170', h: '180', mkg: '0', rev: '0' });
  const [rot, setRot] = useState(true);
  const [rows, setRows] = useState<GroupRow[]>(INITIAL);
  const [plan, setPlan] = useState<Plan | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const box: Box = useMemo(() => ({
    l: +dims.l || 0, w: +dims.w || 0, h: +dims.h || 0, maxKg: +dims.mkg || 0,
  }), [dims]);
  const reserve = +dims.rev || 0;
  const boxValid = [box.l, box.w, box.h].every(v => Number.isFinite(v) && v > 0);

  /** แก้ค่าใด ๆ ที่กระทบผลลัพธ์ ต้องล้างผลลัพธ์เดิมทิ้ง */
  const invalidate = () => { setPlan(null); setMaxStep(m => Math.min(m, 2)); };

  const items: ItemGroup[] = useMemo(() => rows.flatMap(r => {
    const o: ItemGroup = {
      name: r.name.trim() || '-', l: +r.l, w: +r.w, h: +r.h,
      kg: +r.kg || 0, qty: Math.round(+r.qty) || 0, color: r.color,
    };
    return o.l > 0 && o.w > 0 && o.h > 0 && o.qty > 0 ? [o] : [];
  }), [rows]);

  const go = (n: number) => {
    if (n >= 2 && !boxValid) { window.alert('ขนาดตู้ไม่ถูกต้อง'); setStep(1); return; }
    if (n === 3 && !plan) return;
    setStep(n);
    setMaxStep(m => Math.max(m, n));
    window.scrollTo(0, 0);
  };

  const pickTruck = (t: string) => {
    setTruck(t);
    const v = TRUCKS[t];
    if (v) setDims(d => ({ ...d, l: String(v.l), w: String(v.w), h: String(v.h), mkg: String(v.mkg) }));
    invalidate();
  };

  const setDim = (k: keyof typeof dims, v: string) => {
    setDims(d => {
      const nd = { ...d, [k]: v };
      const t = TRUCKS[truck];
      if (t && (+nd.l !== t.l || +nd.w !== t.w || +nd.h !== t.h)) setTruck('custom');
      return nd;
    });
    invalidate();
  };

  /* ตรวจข้อมูลก่อนคำนวณ ห้ามทิ้งแถวที่ผู้ใช้กรอกไว้เงียบ ๆ
     และห้ามออกแผนเมื่อยังไม่ทราบพิกัดน้ำหนักบรรทุกจริง */
  const run = () => {
    const num = (s: string) => s.trim() !== '' && Number.isFinite(Number(s));
    if (![dims.l, dims.w, dims.h].every(s => num(s) && Number(s) > 0)) {
      window.alert('กรอกขนาดพื้นที่บรรทุกเป็นตัวเลขมากกว่า 0 ให้ครบทั้งสามด้าน'); return;
    }
    if (!num(dims.mkg) || Number(dims.mkg) <= 0) {
      window.alert('กรอกพิกัดน้ำหนักบรรทุกจริงของรถ มากกว่า 0 กก. ก่อนคำนวณ\n' +
        'ถ้าไม่ทราบพิกัด ระบบจะตรวจเงื่อนไขน้ำหนักไม่ได้'); return;
    }
    if (!num(dims.rev) || Number(dims.rev) < 0 || Number(dims.rev) >= box.l) {
      window.alert('พื้นที่กันท้ายรถต้องเป็นตัวเลขตั้งแต่ 0 และน้อยกว่าความยาวพื้นที่บรรทุก'); return;
    }
    for (const row of rows) {
      const q = Number(row.qty);
      if (!num(row.qty) || !Number.isSafeInteger(q) || q < 0) {
        window.alert('จำนวนของกลุ่ม ' + (row.name || '-') + ' ต้องเป็นจำนวนเต็มตั้งแต่ 0'); return;
      }
      if (q === 0) continue;
      if (![row.l, row.w, row.h, row.kg].every(s => num(s) && Number(s) > 0)) {
        window.alert('กลุ่ม ' + (row.name || '-') + ' มีจำนวน ' + q + ' ชิ้น แต่ขนาดหรือน้ำหนักยังไม่ครบ\n' +
          'กรอกให้ครบเป็นตัวเลขมากกว่า 0 มิฉะนั้นพัสดุกลุ่มนี้จะไม่ถูกนำไปคำนวณ'); return;
      }
    }
    if (!items.length) { window.alert('ยังไม่ได้ใส่จำนวนพัสดุ (ทุกกลุ่มเป็น 0)'); return; }
    const r = pack(items, box, { allowRotate: rot, rearReserve: reserve });
    setPlan({ ...r, box, reserve });
    setStep(3); setMaxStep(3); window.scrollTo(0, 0);
  };

  useEffect(() => { document.title = 'วางแผนการจัดวาง · LoadPlan 3D'; }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main ref={topRef}
        className="flex-1 w-full max-w-[1180px] mx-auto px-4 py-4 pb-[calc(76px+env(safe-area-inset-bottom,0px))] sm:pb-4">
        <div className="hidden sm:block"><Stepper step={step} maxStep={maxStep} onGo={go} /></div>
        {step === 1 && (
          <Step1Truck
            truck={truck} dims={dims} rot={rot} box={box} reserve={reserve}
            onPickTruck={pickTruck} onDim={setDim}
            onRot={v => { setRot(v); invalidate(); }}
            onNext={() => go(2)}
          />
        )}
        {step === 2 && (
          <Step2Items
            rows={rows} box={box}
            onRows={r => { setRows(r); invalidate(); }}
            onBack={() => go(1)} onRun={run}
          />
        )}
        {step === 3 && plan && (
          <Step3Result plan={plan} onBack={() => go(2)} />
        )}
      </main>
      <div className="sm:hidden"><BottomNav step={step} maxStep={maxStep} onGo={go} /></div>
    </div>
  );
}
