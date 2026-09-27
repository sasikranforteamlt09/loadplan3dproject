import { useState } from 'react';
import { makeRow, DEMO_ROWS, type GroupRow } from '../pages/PlannerPage';
import { PALETTE } from '../config';
import type { Box } from '../lib/pack';
import { IcBox, IcAlert, IcStack, IcCheckCircle, IcGrid, IcRuler, IcCylinder, IcSettings, IcNext } from './Icons';
import BoxArt, { ShapeArt } from './BoxArt';
import { BOX_SIZES, BOX_SOURCE } from '../boxSizes';

interface Props {
  rows: GroupRow[];
  box: Box;
  onRows: (r: GroupRow[]) => void;
  onBack: () => void;
  onRun: () => void;
}

export default function Step2Items({ rows, box, onRows, onBack, onRun }: Props) {
  const [paste, setPaste] = useState(false);
  const [pasteTxt, setPasteTxt] = useState('');
  const [edit, setEdit] = useState(false);
  const [picker, setPicker] = useState(false);

  /** เพิ่มกล่องมาตรฐาน ถ้ามีกลุ่มขนาดเดียวกันอยู่แล้วให้บวกจำนวนแทนการเพิ่มแถวซ้ำ */
  const addStd = (code: string) => {
    const b = BOX_SIZES.find(x => x.code === code)!;
    const same = rows.find(r => +r.l === b.l && +r.w === b.w && +r.h === b.h);
    if (same) {
      onRows(rows.map(r => (r.id === same.id ? { ...r, qty: String((Math.round(+r.qty) || 0) + 1) } : r)));
      return;
    }
    onRows([...rows, makeRow(
      { name: 'กล่องเบอร์ ' + b.code, l: String(b.l), w: String(b.w), h: String(b.h), kg: String(b.kg), qty: '1' },
      rows.length,
    )]);
  };

  const set = (id: number, k: keyof GroupRow, v: string) =>
    onRows(rows.map(r => (r.id === id ? { ...r, [k]: v } : r)));
  /** ทรงกระบอก: เส้นผ่านศูนย์กลางกำหนดทั้งด้านยาวและด้านกว้างของกล่องครอบ */
  const setDia = (id: number, v: string) =>
    onRows(rows.map(r => (r.id === id ? { ...r, l: v, w: v } : r)));
  const bump = (id: number, d: number) =>
    onRows(rows.map(r => (r.id === id ? { ...r, qty: String(Math.max(0, (Math.round(+r.qty) || 0) + d)) } : r)));

  const n = rows.reduce((s, r) => s + (Math.round(+r.qty) || 0), 0);
  const v = rows.reduce((s, r) => s + (Math.round(+r.qty) || 0) * (+r.l || 0) * (+r.w || 0) * (+r.h || 0), 0);
  const cap = box.l * box.w * box.h;
  const p = cap > 0 ? (v / cap) * 100 : 0;
  const kg = rows.reduce((s, r) => s + (Math.round(+r.qty) || 0) * (+r.kg || 0), 0);

  /* กลุ่มที่ใหญ่กว่าตู้ ไม่ว่าจะหมุนอย่างไรก็วางไม่ได้ */
  const bd = [box.l, box.w, box.h].sort((a, b) => a - b);
  const oversize = rows
    .filter(r => {
      const d = [+r.l || 0, +r.w || 0, +r.h || 0].sort((a, b) => a - b);
      return d[2] > 0 && (Math.round(+r.qty) || 0) > 0 && (d[0] > bd[0] || d[1] > bd[1] || d[2] > bd[2]);
    })
    .map(r => r.name);

  const doPaste = () => {
    const txt = pasteTxt.trim();
    if (!txt) { setPaste(false); return; }
    const add: GroupRow[] = [];
    txt.split(/\r?\n/).forEach(line => {
      const c = line.split(/\t|,|\s{2,}/).map(s => s.trim()).filter(s => s !== '');
      if (c.length >= 5 && !isNaN(+c[1])) {
        add.push(makeRow(
          { name: c[0], l: String(+c[1]), w: String(+c[2]), h: String(+c[3]), kg: String(+c[4] || 0), qty: String(+(c[5] || 0)) },
          rows.length + add.length,
        ));
      }
    });
    onRows([...rows, ...add]);
    setPasteTxt(''); setPaste(false);
  };

  return (
    <div className="space-y-4">
      {/* ---- สรุปด้านบน ---- */}
      <section className="lp-card p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="lp-sect mb-0">
            <span className="lp-sect-ico"><IcStack /></span>
            <span className="lp-sect-t">
              รวมพัสดุในกองพัก
              <span className="lp-sect-s">พื้นที่บรรทุก {box.l}×{box.w}×{box.h} ซม.</span>
            </span>
          </div>
          <span className={p > 100 ? 'lp-chip-brand' : 'lp-chip-ok'}>
            {p > 100 ? 'เกินความจุ' : 'อยู่ในความจุ'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          <Tile v={n.toLocaleString('th-TH')} t="ชิ้นทั้งหมด" big />
          <Tile v={(v / 1e6).toFixed(2)} t="ปริมาตร (ลบ.ม.)" />
          <Tile v={kg.toFixed(0)} t="น้ำหนักรวม (กก.)" />
        </div>

        <div className="mt-3">
          <div className="flex justify-between text-[13px] font-semibold mb-1.5">
            <span className="text-muted">เทียบกับปริมาตรตู้</span>
            <span className={p > 100 ? 'text-danger' : 'text-navy-700'}>{p.toFixed(0)}%</span>
          </div>
          <div className="lp-gauge">
            <i className={`block h-full rounded-pill transition-all ${p > 100 ? 'bg-danger' : 'bg-ok'}`}
              style={{ width: Math.min(100, p) + '%' }} />
          </div>
        </div>

        {oversize.length > 0 && (
          <div className="flex gap-2.5 items-start bg-danger-bg border-1.5 border-danger/30 rounded-ctl p-3 mt-3">
            <span className="text-danger shrink-0 mt-0.5"><IcAlert size={20} /></span>
            <p className="text-[13.5px] leading-snug text-ink m-0">
              กลุ่ม <b>{oversize.join(' · ')}</b> ใหญ่กว่าพื้นที่บรรทุก ระบบจะวางไม่ได้ ตรวจดูว่ากรอกตัวเลขถูกหรือไม่
            </p>
          </div>
        )}
        {p > 100 && oversize.length === 0 && (
          <p className="lp-note mt-2.5">ปริมาตรพัสดุรวมมากกว่าปริมาตรตู้ อาจมีพัสดุบางส่วนที่ระบบวางไม่ได้</p>
        )}
      </section>

      {/* ---- รายการกลุ่มขนาด ---- */}
      <section className="lp-card p-4">
        <div className="lp-sect">
          <span className="lp-sect-ico"><IcBox /></span>
          <span className="lp-sect-t">
            {edit ? 'ตั้งค่ากลุ่มขนาด' : 'นับจำนวนแต่ละกลุ่มขนาด'}
            <span className="lp-sect-s">
              {edit ? 'สำหรับผู้ดูแล · ทำล่วงหน้าครั้งเดียว' : 'ที่หน้างานกด + หรือ − อย่างเดียว ไม่ต้องวัดอะไร'}
            </span>
          </span>
        </div>

        <div>
          {rows.map(r => (
            <div key={r.id} className="lp-row flex-wrap">
              <span aria-hidden="true" className="lp-row-art shrink-0">
                <ShapeArt shape={r.shape} l={+r.l || 1} w={+r.w || 1} h={+r.h || 1} color={r.color} size={42} />
              </span>

              <span className="flex-1 min-w-0">
                {edit ? (
                  <input aria-label={`ชื่อกลุ่มขนาด ${r.name}`}
                    className="lp-input !min-h-[40px] !text-[15px] px-2 py-1"
                    value={r.name} onChange={e => set(r.id, 'name', e.target.value)} />
                ) : (
                  <>
                    <b className="block text-[15.5px] text-ink leading-tight truncate">{r.name}</b>
                    <span className="block text-[12px] text-muted leading-snug whitespace-nowrap overflow-hidden text-ellipsis">
                      {r.shape === 'cyl'
                        ? <>กล่องครอบ {r.l || 0}×{r.l || 0}×{r.h || 0} ซม. · {r.kg || 0} กก.</>
                        : <>{r.l || 0}×{r.w || 0}×{r.h || 0} ซม. · {r.kg || 0} กก.</>}
                    </span>
                  </>
                )}
              </span>

              <span className="flex items-center gap-1.5 shrink-0">
                <button type="button" aria-label={`ลดจำนวน ${r.name}`} onClick={() => bump(r.id, -1)}
                  className="lp-step-minus">−</button>
                <input type="number" min={0} step={1} inputMode="numeric"
                  aria-label={`จำนวนของ ${r.name}`} className="lp-qty"
                  value={r.qty} onChange={e => set(r.id, 'qty', e.target.value)} />
                <button type="button" aria-label={`เพิ่มจำนวน ${r.name}`} onClick={() => bump(r.id, 1)}
                  className="lp-step-plus">+</button>
              </span>

              {edit && (
                <div className="basis-full w-full mt-2 pl-0 sm:pl-[54px]">
                  {r.shape === 'cyl' ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <Field label="กว้างสุด (⌀)" aria={`ความกว้างที่สุดของ ${r.name}`}
                          value={r.l} onChange={v => setDia(r.id, v)} />
                        <Field label="สูง" aria={`ความสูงของ ${r.name}`}
                          value={r.h} onChange={v => set(r.id, 'h', v)} />
                        <Field label="กก./ชิ้น" aria={`น้ำหนักต่อชิ้นของ ${r.name}`}
                          value={r.kg} onChange={v => set(r.id, 'kg', v)} />
                      </div>
                      <p className="text-[12px] text-muted mt-1.5 mb-0 leading-snug">
                        วัดด้านที่กว้างที่สุดกับความสูง ระบบประมาณเป็นกล่องครอบเล็กที่สุด
                        <b className="text-navy-700"> {(+r.l || 0)}×{(+r.l || 0)}×{(+r.h || 0)} ซม.</b>
                      </p>
                    </>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      <Field label="ยาว" aria={`ยาวของ ${r.name}`} value={r.l} onChange={v => set(r.id, 'l', v)} />
                      <Field label="กว้าง" aria={`กว้างของ ${r.name}`} value={r.w} onChange={v => set(r.id, 'w', v)} />
                      <Field label="สูง" aria={`สูงของ ${r.name}`} value={r.h} onChange={v => set(r.id, 'h', v)} />
                      <Field label="กก." aria={`น้ำหนักต่อชิ้นของ ${r.name}`} value={r.kg} onChange={v => set(r.id, 'kg', v)} />
                    </div>
                  )}
                  <button type="button" onClick={() => onRows(rows.filter(x => x.id !== r.id))}
                    className="mt-2 min-h-[40px] px-3 rounded-ctl border-1.5 border-danger/30 text-danger bg-white
                               text-[13px] font-bold hover:bg-danger-bg">ลบกลุ่มนี้</button>
                </div>
              )}
            </div>
          ))}
        </div>

        {!edit ? (
          <>
            <p className="lp-note mt-3">
              พัสดุที่ไม่เข้ากลุ่มไหนพอดี ให้เลือกกลุ่มที่ใกล้เคียงที่สุดด้วยสายตา
            </p>
            <button type="button" onClick={() => setEdit(true)}
              className="mt-3 w-full flex items-center gap-3 p-3.5 rounded-card border-1.5 border-navy-200
                         bg-navy-50 hover:border-navy-300 transition text-left">
              <span className="w-10 h-10 rounded-ctl bg-white border border-line grid place-items-center
                               text-navy-600 shrink-0"><IcSettings size={20} /></span>
              <span className="flex-1 min-w-0">
                <b className="block text-[15px] text-ink leading-tight">ตั้งค่ากลุ่มขนาด</b>
                <span className="block text-[12.5px] text-muted leading-snug">
                  เพิ่ม แก้ หรือลบกลุ่มขนาด · สำหรับผู้ดูแล ทำล่วงหน้าครั้งเดียว
                </span>
              </span>
              <span aria-hidden="true" className="text-navy-400 shrink-0"><IcNext size={20} /></span>
            </button>
          </>
        ) : picker ? (
          <div className="mt-3">
            <button type="button" onClick={() => setPicker(false)}
              className="lp-btn-outline !min-h-[44px] !text-[14px] mb-3">← กลับ</button>
            <p className="text-[14px] font-bold text-ink m-0 mb-0.5">แตะกล่องเพื่อเพิ่มเข้ารายการ</p>
            <p className="text-[12px] text-muted m-0 mb-3 leading-snug">{BOX_SOURCE}</p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {BOX_SIZES.map((b, i) => (
                <button key={b.code} type="button" onClick={() => addStd(b.code)}
                  aria-label={`เพิ่มกล่องเบอร์ ${b.code} ขนาด ${b.l}x${b.w}x${b.h} เซนติเมตร`}
                  className="rounded-ctl border-1.5 border-navy-200 bg-white p-2 hover:border-brand-500 active:bg-brand-50 transition">
                  <span className="grid place-items-center h-[52px]">
                    <BoxArt l={b.l} w={b.w} h={b.h} color={PALETTE[i % PALETTE.length]} size={48} />
                  </span>
                  <b className="block text-[13px] text-ink leading-tight mt-1">เบอร์ {b.code}</b>
                  <span className="block text-[10.5px] text-muted leading-tight tabular-nums">
                    {b.l}×{b.w}×{b.h}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : paste ? (
          <div className="mt-3">
            <button type="button" onClick={() => setPaste(false)}
              className="lp-btn-outline !min-h-[44px] !text-[14px] mb-3">← กลับ</button>
            <label className="lp-label" htmlFor="pasteTa">
              คัดลอกจาก Excel แล้ววางที่นี่ (คอลัมน์: ชื่อ ยาว กว้าง สูง น้ำหนัก จำนวน)
            </label>
            <textarea id="pasteTa" rows={4} value={pasteTxt} onChange={e => setPasteTxt(e.target.value)}
              className="w-full border-1.5 border-navy-200 rounded-ctl p-2.5 font-mono text-[12px]" />
            <button type="button" className="lp-btn-primary !min-h-[46px] !text-[15px] mt-2" onClick={doPaste}>นำเข้า</button>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            <AddBtn ico={<IcGrid size={20} />} title="เพิ่มจากกล่องมาตรฐาน"
              desc="เลือกจากเบอร์กล่องไปรษณีย์ ไม่ต้องวัดเอง" onClick={() => setPicker(true)} />
            <AddBtn ico={<IcRuler size={20} />} title="เพิ่มกล่องขนาดอื่น"
              desc="กรอกขนาดเอง สำหรับกล่องที่ไม่เข้าเบอร์"
              onClick={() => onRows([...rows, makeRow({}, rows.length)])} />
            <AddBtn ico={<IcCylinder size={20} />} title="เพิ่มพัสดุรูปทรงอื่น"
              desc="ระบบวัดเป็นกล่องครอบเล็กที่สุดให้"
              onClick={() => onRows([...rows, makeRow({ name: 'พัสดุรูปทรงอื่น', shape: 'cyl' }, rows.length)])} />

            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-[13.5px]">
              <button type="button" id="btn-demo" className="text-navy-600 underline min-h-[36px]"
                onClick={() => onRows(DEMO_ROWS.map(makeRow))}>ใส่ข้อมูลตัวอย่าง</button>
              <button type="button" className="text-navy-600 underline min-h-[36px]"
                onClick={() => setPaste(true)}>นำเข้าจาก Excel</button>
              <button type="button" className="text-danger underline min-h-[36px]"
                onClick={() => { if (n === 0 || window.confirm('ล้างจำนวนพัสดุทุกกลุ่มเป็น 0 ใช่หรือไม่')) onRows(rows.map(r => ({ ...r, qty: '0' }))); }}>
                ล้างจำนวนเป็น 0
              </button>
            </div>

            <button type="button" onClick={() => setEdit(false)}
              className="lp-btn-primary w-full !min-h-[50px] mt-1">
              <IcCheckCircle size={20} /> ตั้งค่าเสร็จแล้ว กลับไปนับพัสดุ
            </button>
          </div>
        )}

        <p className="lp-note mt-3">
          พัสดุที่หนักต่ำกว่า 1 กก. ซึ่งรวมลงถุงกระสอบ อยู่นอกขอบเขตการคำนวณ ·
          พัสดุที่ไม่ใช่ทรงสี่เหลี่ยมแต่ยังคงรูป ระบบประมาณด้วยกล่องครอบเล็กที่สุด
        </p>
      </section>

      <div className="lp-bar flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button type="button" className="lp-btn-outline" onClick={onBack}>← กลับไปเลือกรถ</button>
        <div className="flex flex-col sm:items-end gap-1">
          {n === 0 && <span className="text-[13px] font-semibold text-muted">ยังไม่ได้ใส่จำนวนพัสดุ</span>}
          <button type="button" id="btn-run" className="lp-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={n === 0} onClick={onRun}>
            <IcCheckCircle size={20} /> คำนวณแผนการจัดวาง
          </button>
        </div>
      </div>
    </div>
  );
}

function AddBtn({ ico, title, desc, onClick }: {
  ico: React.ReactNode; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick}
      className="w-full flex items-center gap-3 p-3 rounded-ctl border-1.5 border-navy-200 bg-white
                 hover:border-brand-500 active:bg-brand-50 transition text-left min-h-[62px]">
      <span className="w-10 h-10 rounded-ctl bg-navy-100 text-navy-700 grid place-items-center shrink-0">{ico}</span>
      <span className="flex-1 min-w-0">
        <b className="block text-[15px] text-ink leading-tight">{title}</b>
        <span className="block text-[12.5px] text-muted leading-snug">{desc}</span>
      </span>
      <span aria-hidden="true" className="text-navy-300 text-[22px] font-bold leading-none shrink-0">+</span>
    </button>
  );
}

function Field({ label, aria, value, onChange }: {
  label: string; aria: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block text-[11.5px] font-semibold text-muted mb-1 leading-tight">{label}</span>
      <input type="number" step="0.1" inputMode="decimal" aria-label={aria}
        className="w-full min-h-[44px] px-2 text-center rounded-ctl border-1.5 border-navy-200 bg-white
                   text-[16px] font-bold tabular-nums focus:border-brand-500"
        value={value} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Tile({ v, t, big }: { v: string; t: string; big?: boolean }) {
  return (
    <div className="lp-stat !p-3 text-center">
      <b className={`block tabular-nums text-navy-800 leading-tight ${big ? 'text-[26px]' : 'text-[21px]'}`}>{v}</b>
      <span className="block text-[12px] font-semibold text-muted mt-0.5 leading-snug">{t}</span>
    </div>
  );
}
