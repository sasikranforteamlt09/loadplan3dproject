import { useMemo, useRef, useState, useEffect } from 'react';
import { AppHeader } from '../components/Layout';
import Stepper from '../components/Stepper';
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
}

export interface Plan extends PackResult { box: Box; reserve: number }

let nextId = 1;
export function makeRow(v: Partial<Omit<GroupRow, 'id' | 'color'>>, index: number): GroupRow {
  return {
    id: nextId++,
    name: v.name ?? 'กลุ่ม ' + (index + 1),
    l: v.l ?? '', w: v.w ?? '', h: v.h ?? '', kg: v.kg ?? '', qty: v.qty ?? '0',
    color: PALETTE[index % PALETTE.length],
  };
}

const INITIAL: GroupRow[] = [
  { name: 'กลุ่ม A', l: '14', w: '20', h: '6', kg: '1.2', qty: '0' },
  { name: 'กลุ่ม B', l: '17', w: '25', h: '9', kg: '2', qty: '0' },
  { name: 'กลุ่ม C', l: '20', w: '30', h: '11', kg: '3.5', qty: '0' },
].map(makeRow);

export const DEMO_ROWS: Omit<GroupRow, 'id' | 'color'>[] = [
  { name: 'กลุ่ม A', l: '14', w: '20', h: '6', kg: '1.2', qty: '40' },
  { name: 'กลุ่ม B', l: '17', w: '25', h: '9', kg: '2', qty: '35' },
  { name: 'กลุ่ม C', l: '20', w: '30', h: '11', kg: '3.5', qty: '30' },
  { name: 'กลุ่ม D', l: '22', w: '35', h: '14', kg: '5', qty: '25' },
  { name: 'กลุ่ม E', l: '24', w: '40', h: '17', kg: '8', qty: '15' },
  { name: 'กล่องใหญ่', l: '40', w: '60', h: '40', kg: '18', qty: '6' },
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
  const boxValid = box.l > 0 && box.w > 0 && box.h > 0;

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

  const run = () => {
    if (!items.length) { window.alert('ยังไม่ได้ใส่จำนวนพัสดุ (ทุกกลุ่มเป็น 0)'); return; }
    const r = pack(items, box, { allowRotate: rot, rearReserve: reserve });
    setPlan({ ...r, box, reserve });
    setStep(3); setMaxStep(3); window.scrollTo(0, 0);
  };

  useEffect(() => { document.title = 'วางแผนการจัดวาง · LoadPlan 3D'; }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main ref={topRef} className="flex-1 w-full max-w-[1180px] mx-auto px-4 py-4">
        <Stepper step={step} maxStep={maxStep} onGo={go} />
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
    </div>
  );
}
