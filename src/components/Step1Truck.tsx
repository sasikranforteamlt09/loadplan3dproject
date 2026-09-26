import { useRef } from 'react';
import Viewer3DCanvas from './Viewer3DCanvas';
import { TRUCKS } from '../config';
import type { Box } from '../lib/pack';
import { IcTruck, IcRuler, IcCube3D, IcCheckCircle, IcAlert, IcRotate, TruckArt, CustomArt } from './Icons';

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
  const vol = (box.l * box.w * box.h) / 1e6;

  return (
    <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-4 items-start" ref={nodeRef}>
      <div className="space-y-4">
        <section className="lp-card p-4">
          <div className="lp-sect">
            <span className="lp-sect-ico"><IcTruck /></span>
            <span className="lp-sect-t">
              ประเภทรถบรรทุก
              <span className="lp-sect-s">เลือกรถที่จะใช้จัดวางในรอบนี้</span>
            </span>
          </div>

          <div className="space-y-2.5">
            <PickCard
              id="t4" sel={truck === 't4'} onPick={onPickTruck}
              title="รถ 4 ล้อ ตู้ทึบ" desc="รถที่ใช้ในงานวิจัย" chip="ใช้ในการทดลอง"
              art={<TruckArt className="w-[54px] h-[26px]" />}
            />
            <PickCard
              id="custom" sel={truck === 'custom'} onPick={onPickTruck}
              title="กำหนดขนาดเอง" desc="กรอกขนาดตู้ด้วยตนเอง"
              art={<CustomArt className="w-[46px] h-[24px]" />}
            />
          </div>
        </section>

        <section className="lp-card p-4">
          <div className="lp-sect">
            <span className="lp-sect-ico"><IcRuler /></span>
            <span className="lp-sect-t">
              ขนาดภายในตู้
              <span className="lp-sect-s">วัดจากผนังถึงผนัง หน่วยเซนติเมตร</span>
            </span>
          </div>

          {isPlaceholder && (
            <div className="flex gap-2.5 items-start bg-warn-bg border-1.5 border-brand-200 rounded-ctl p-3 mb-3.5">
              <span className="text-warn shrink-0 mt-0.5"><IcAlert size={20} /></span>
              <p className="text-[13.5px] leading-snug text-ink m-0">
                <b>ขนาดรถชุดนี้เป็นค่าสมมติ</b> รอค่าที่วัดจริงจากหน้างาน
                ห้ามนำตัวเลขชุดนี้ไปใส่ในเล่มปริญญานิพนธ์
              </p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            <Num id="bl" label="ยาว (ลึก)" unit="ซม." value={dims.l} onChange={v => onDim('l', v)} />
            <Num id="bw" label="กว้าง" unit="ซม." value={dims.w} onChange={v => onDim('w', v)} />
            <Num id="bh" label="สูง" unit="ซม." value={dims.h} onChange={v => onDim('h', v)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5 mt-3">
            <Num id="mkg" label="น้ำหนักบรรทุกสูงสุด" hint="0 = ไม่จำกัด" unit="กก."
              value={dims.mkg} onChange={v => onDim('mkg', v)} />
            <Num id="rev" label="กันพื้นที่ท้ายรถให้ถุงกระสอบ" unit="ซม."
              value={dims.rev} onChange={v => onDim('rev', v)} />
          </div>

          <label
            htmlFor="rot"
            className={[
              'flex items-center gap-3 mt-3.5 p-3 rounded-ctl border-1.5 cursor-pointer transition',
              rot ? 'border-brand-500 bg-brand-50' : 'border-navy-200 bg-white',
            ].join(' ')}
          >
            <span className={`shrink-0 ${rot ? 'text-brand-700' : 'text-navy-400'}`}><IcRotate size={22} /></span>
            <span className="flex-1 text-[15px] font-semibold leading-snug">
              อนุญาตให้หมุนกล่องได้
              <span className="block text-[13px] font-normal text-muted">พลิกกล่องได้ทั้ง 6 ทิศทางเพื่อให้วางได้มากขึ้น</span>
            </span>
            <input id="rot" type="checkbox" checked={rot} onChange={e => onRot(e.target.checked)}
              className="w-6 h-6 accent-brand-500 shrink-0" />
          </label>
        </section>
      </div>

      <div className="space-y-4">
        <section className="lp-card overflow-hidden">
          <div className="p-4 pb-3">
            <div className="lp-sect mb-0">
              <span className="lp-sect-ico"><IcCube3D /></span>
              <span className="lp-sect-t">
                ตัวอย่างตู้ที่เลือก
                <span className="lp-sect-s">ลากเพื่อหมุน · เส้นสีแดงคือประตูท้ายรถ</span>
              </span>
            </div>
          </div>

          {valid ? (
            <>
              <div className="bg-navy-50 border-y border-line px-3 py-3">
                <Viewer3DCanvas box={box} placed={[]} reserve={reserve} height={340}
                  label="ภาพตัวอย่างตู้บรรทุกแบบสามมิติ" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-line">
                <Mini k="ยาว" v={`${box.l}`} u="ซม." />
                <Mini k="กว้าง" v={`${box.w}`} u="ซม." />
                <Mini k="สูง" v={`${box.h}`} u="ซม." />
                <Mini k="ปริมาตร" v={vol.toFixed(2)} u="ลบ.ม." />
              </div>
            </>
          ) : (
            <div className="px-4 pb-4">
              <div className="flex gap-2.5 items-center bg-danger-bg border-1.5 border-danger/30 rounded-ctl p-3.5">
                <span className="text-danger shrink-0"><IcAlert size={22} /></span>
                <p className="text-[14px] font-semibold text-ink m-0">กรอกขนาดตู้ให้ครบทั้งสามด้านก่อน</p>
              </div>
            </div>
          )}
        </section>

        <div className="lp-bar flex justify-end">
          <button type="button" className="lp-btn-primary w-full sm:w-auto" onClick={onNext}>
            <IcCheckCircle size={20} /> ถัดไป: นับพัสดุ
          </button>
        </div>
      </div>
    </div>
  );
}

function Mini({ k, v, u }: { k: string; v: string; u: string }) {
  return (
    <div className="bg-white px-3 py-2.5 text-center">
      <b className="block text-[19px] font-bold text-navy-800 tabular-nums leading-tight">{v}</b>
      <span className="text-[12px] text-muted">{k} · {u}</span>
    </div>
  );
}

function PickCard({ id, sel, onPick, title, desc, chip, art }: {
  id: string; sel: boolean; onPick: (t: string) => void;
  title: string; desc: string; chip?: string; art: React.ReactNode;
}) {
  return (
    <button type="button" onClick={() => onPick(id)} aria-pressed={sel}
      className={`lp-pick ${sel ? 'lp-pick-on' : ''}`}>
      <span className="lp-pick-ico">{art}</span>
      <span className="flex-1 min-w-0">
        <span className="flex items-center gap-2 flex-wrap">
          <b className="text-[15.5px] text-ink leading-tight">{title}</b>
          {chip && <span className="lp-chip-brand">{chip}</span>}
        </span>
        <span className="block text-[13px] text-muted leading-snug mt-0.5">{desc}</span>
      </span>
      <span aria-hidden="true" className={`shrink-0 ${sel ? 'text-brand-600' : 'text-navy-200'}`}>
        <IcCheckCircle size={24} />
      </span>
    </button>
  );
}

function Num({ id, label, hint, unit, value, onChange }: {
  id: string; label: string; hint?: string; unit: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="lp-label" htmlFor={id}>
        {label}
        {hint && <span className="font-normal text-muted"> · {hint}</span>}
      </label>
      <div className="lp-field">
        <input id={id} type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} />
        <span className="unit">{unit}</span>
      </div>
    </div>
  );
}
