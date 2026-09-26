import { useRef } from 'react';
import Viewer3DCanvas from './Viewer3DCanvas';
import { TRUCKS } from '../config';
import type { Box } from '../lib/pack';

interface Props {
  truck: string;
  dims: { l: string; w: string; h: string; mkg: string; rev: string };
  rot: boolean;
  box: Box;
  reserve: number;
  onPickTruck: (t: string) => void;
  onDim: (k: 'l' | 'w' | 'h' | 'mkg' | 'rev', v: string) => void;
  onRot: (v: boolean) => void;
  onNext: () => void;
}

export default function Step1Truck({ truck, dims, rot, box, reserve, onPickTruck, onDim, onRot, onNext }: Props) {
  const valid = box.l > 0 && box.w > 0 && box.h > 0;
  const nodeRef = useRef(null);
  const isPlaceholder = !!TRUCKS[truck]?.placeholder;

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-4" ref={nodeRef}>
      <div className="space-y-4">
        <section className="lp-card p-4">
          <h2 className="lp-h2 mb-3">เลือกประเภทรถ</h2>
          <div className="grid grid-cols-2 gap-3">
            <TruckCard id="t4" sel={truck === 't4'} onPick={onPickTruck}
              title="รถ 4 ล้อ ตู้ทึบ" desc="รถที่ใช้ในการวิจัย">
              <svg width="64" height="30" viewBox="0 0 64 30" aria-hidden="true">
                <rect x="1" y="3" width="42" height="19" rx="2" fill="#1f3c58" />
                <path d="M43 9h11l7 7v6H43z" fill="#2f5278" />
                <circle cx="12" cy="25" r="4" fill="#33475b" /><circle cx="52" cy="25" r="4" fill="#33475b" />
              </svg>
            </TruckCard>
            <TruckCard id="custom" sel={truck === 'custom'} onPick={onPickTruck}
              title="กำหนดขนาดเอง" desc="ใส่ขนาดตู้เอง">
              <svg width="64" height="30" viewBox="0 0 64 30" aria-hidden="true">
                <rect x="8" y="3" width="48" height="22" rx="3" fill="none" stroke="#1f3c58" strokeWidth="2" strokeDasharray="4 3" />
                <text x="32" y="19" fontSize="12" textAnchor="middle" fill="#1f3c58">ก×ย×ส</text>
              </svg>
            </TruckCard>
          </div>
        </section>

        <section className="lp-card p-4">
          <h2 className="lp-h2 mb-3">ขนาดภายในตู้ (เซนติเมตร)</h2>
          {isPlaceholder && (
            <p className="lp-warn">
              <b>ขนาดรถ 4 ล้อตอนนี้เป็นค่าสมมติ</b> รอค่าที่วัดจริงจากหน้างาน ห้ามนำตัวเลขชุดนี้ไปใส่ในเล่ม
            </p>
          )}
          <div className="grid grid-cols-3 gap-2">
            <Num id="bl" label="ยาว (ลึก)" value={dims.l} onChange={v => onDim('l', v)} />
            <Num id="bw" label="กว้าง" value={dims.w} onChange={v => onDim('w', v)} />
            <Num id="bh" label="สูง" value={dims.h} onChange={v => onDim('h', v)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mt-2">
            <Num id="mkg" label="น้ำหนักบรรทุกสูงสุด (กก.) · 0 = ไม่จำกัด" value={dims.mkg} onChange={v => onDim('mkg', v)} />
            <Num id="rev" label="กันพื้นที่ท้ายรถให้ถุงกระสอบ (ซม.)" value={dims.rev} onChange={v => onDim('rev', v)} />
          </div>
          <label className="flex items-center gap-3 mt-3 min-h-[44px] cursor-pointer text-[15px]">
            <input id="rot" type="checkbox" checked={rot} onChange={e => onRot(e.target.checked)}
              className="w-5 h-5 accent-brand-500" />
            อนุญาตให้หมุนกล่องได้ทั้ง 6 ทิศทาง
          </label>
        </section>
      </div>

      <div className="space-y-4">
        <section className="lp-card p-4">
          <h2 className="lp-h2 mb-3">ตัวอย่างตู้ที่เลือก</h2>
          {valid ? (
            <>
              <Viewer3DCanvas box={box} placed={[]} reserve={reserve} height={360}
                label="ภาพตัวอย่างตู้บรรทุกแบบสามมิติ" />
              <p className="text-[14px] text-navy-600 mt-2 text-center">
                ยาว {box.l} × กว้าง {box.w} × สูง {box.h} ซม. · ปริมาตร {(box.l * box.w * box.h / 1e6).toFixed(2)} ลบ.ม.
              </p>
            </>
          ) : (
            <p className="lp-warn">กรอกขนาดตู้ให้ครบทั้งสามด้านก่อน</p>
          )}
          <p className="lp-note mt-2">ลากเพื่อหมุน · หมุนล้อเมาส์เพื่อซูม · ด้านที่มีเส้นสีแดงคือท้ายรถ (ประตู)</p>
        </section>
        <div className="lp-bar flex justify-end">
          <button type="button" className="lp-btn-primary w-full sm:w-auto" onClick={onNext}>
            ถัดไป: นับพัสดุ →
          </button>
        </div>
      </div>
    </div>
  );
}

function TruckCard({ id, sel, onPick, title, desc, children }: {
  id: string; sel: boolean; onPick: (t: string) => void; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => onPick(id)} aria-pressed={sel}
      className={[
        'text-left rounded-lg border-2 p-3 min-h-[44px] transition bg-white',
        sel ? 'border-brand-500 bg-brand-50' : 'border-navy-200 hover:border-navy-300',
      ].join(' ')}>
      <span className="block mb-1">{children}</span>
      <b className="block text-[15px] text-ink">{title}</b>
      <span className="text-[12.5px] text-muted">{desc}</span>
    </button>
  );
}

function Num({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="lp-label" htmlFor={id}>{label}</label>
      <input id={id} type="number" inputMode="decimal" className="lp-input text-center"
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}
