import { notify, ask } from './Dialog';
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

  /** ทำสำเนากลุ่ม ใช้เมื่อพัสดุขนาดเดียวกันมีน้ำหนักต่างกันมาก
      คัดลอกขนาดมาให้ ผู้ดูแลแก้เฉพาะน้ำหนักและชื่อ จำนวนเริ่มที่ 0 เสมอ */
  const dup = (id: number) => {
    const i = rows.findIndex(r => r.id === id);
    if (i < 0) return;
    const r = rows[i];
    const copy = makeRow(
      { name: r.name + ' (น้ำหนักอื่น)', l: r.l, w: r.w, h: r.h, kg: r.kg, qty: '0', shape: r.shape },
      rows.length,
    );
    onRows([...rows.slice(0, i + 1), copy, ...rows.slice(i + 1)]);
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

  /* อ่านข้อมูลนำเข้าแบบเก็บช่องว่างไว้ ไม่ตัดทิ้ง เพื่อไม่ให้คอลัมน์เลื่อน
     ต้องครบ 6 คอลัมน์ทุกแถว ถ้ามีแถวใดผิดจะไม่รับทั้งชุด */
  const doPaste = () => {
    const txt = pasteTxt.trim();
    if (!txt) { setPaste(false); return; }
    const add: GroupRow[] = [];
    const lines = txt.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;
      const c = (line.includes('\t') ? line.split('\t')
        : line.includes(',') ? line.split(',')
        : line.trim().split(/\s{2,}/)).map(s => s.trim());
      if (c.length !== 6 || c.some(s => s === '')) {
        void notify('นำเข้าข้อมูลไม่ได้', 'แถวที่ ' + (i + 1) + ': ต้องมีครบ 6 คอลัมน์ (ชื่อ ยาว กว้าง สูง น้ำหนัก จำนวน) และห้ามเว้นช่องว่าง');
        return;
      }
      const [l, w, h, kg, qty] = c.slice(1).map(Number);
      if (![l, w, h, kg, qty].every(Number.isFinite) ||
          l <= 0 || w <= 0 || h <= 0 || kg <= 0 ||
          !Number.isSafeInteger(qty) || qty < 0) {
        void notify('นำเข้าข้อมูลไม่ได้', 'แถวที่ ' + (i + 1) + ': ขนาดและน้ำหนักต้องมากกว่า 0 และจำนวนต้องเป็นจำนวนเต็มตั้งแต่ 0');
        return;
      }
      add.push(makeRow({ name: c[0], l: String(l), w: String(w), h: String(h),
        kg: String(kg), qty: String(qty) }, rows.length + add.length));
    }
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
            {p > 100 ? 'ปริมาตรรวมเกินตู้' : 'ปริมาตรรวมไม่เกินตู้'}
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

        {edit && (
          <div className="flex gap-2.5 items-start bg-warn-bg border-1.5 border-brand-200 rounded-ctl p-3 mb-3.5">
            <span className="text-warn shrink-0 mt-0.5"><IcAlert size={20} /></span>
            <p className="text-[13px] leading-snug text-ink m-0">
              <b>น้ำหนักที่ใส่ไว้เป็นค่าตั้งต้น ไม่ใช่ค่าที่ชั่งจริง</b> ·
              กล่องเล็กอาจหนักกว่ากล่องใหญ่ได้ ระบบเรียงลำดับตามน้ำหนัก ไม่ใช่ขนาด
              จึงต้องสุ่มชั่งตัวอย่างกลุ่มละ 3–5 ชิ้นที่หน้างานแล้วแก้ตัวเลขก่อน
              จึงจะนำผลไปใช้อ้างอิงในเล่มได้
            </p>
          </div>
        )}

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
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button type="button" onClick={() => dup(r.id)}
                      className="min-h-[40px] px-3 rounded-ctl border-1.5 border-navy-300 text-navy-700 bg-white
                                 text-[13px] font-bold hover:bg-navy-50">+ เพิ่มกลุ่มน้ำหนักอื่น ขนาดเดิม</button>
                    <button type="button" onClick={() => onRows(rows.filter(x => x.id !== r.id))}
                      className="min-h-[40px] px-3 rounded-ctl border-1.5 border-danger/30 text-danger bg-white
                                 text-[13px] font-bold hover:bg-danger-bg">ลบกลุ่มนี้</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {!edit ? (
          <>
            <p className="lp-note mt-3">
              พัสดุที่ขนาดไม่ตรงกับกลุ่มใด ให้แยกเป็นกลุ่มใหม่แล้ววัดขนาดและน้ำหนักก่อนคำนวณ ·
              การเลือกกลุ่มใกล้เคียงด้วยสายตาทำให้ผลการตรวจฐานรองรับและการวางไม่ตรงกับพัสดุจริง
            </p>
            <button type="button" onClick={() => setEdit(true)}
              className="mt-3 w-full flex items-center gap-3 p-3.5 rounded-card border-1.5 border-navy-800
                         bg-navy-700 hover:bg-navy-600 transition text-left">
              <span className="w-11 h-11 rounded-ctl bg-brand-500 grid place-items-center
                               text-navy-900 shrink-0"><IcSettings size={22} /></span>
              <span className="flex-1 min-w-0">
                <b className="block text-[15.5px] text-white leading-tight">ตั้งค่ากลุ่มขนาด</b>
                <span className="block text-[12.5px] text-navy-200 leading-snug">
                  เพิ่ม แก้ หรือลบกลุ่มขนาด · สำหรับผู้ดูแล ทำล่วงหน้าครั้งเดียว
                </span>
              </span>
              <span aria-hidden="true" className="text-brand-400 shrink-0"><IcNext size={22} /></span>
            </button>
          </>
        ) : picker ? (
          <div className="mt-3">
            <button type="button" onClick={() => setPicker(false)}
              className="lp-btn-outline !min-h-[44px] !text-[14px] mb-3">← กลับ</button>
            <p className="text-[14px] font-bold text-ink m-0 mb-0.5">แตะกล่องเพื่อเพิ่มเข้ารายการ</p>
            <p className="text-[12.5px] text-muted m-0 mb-1.5 leading-snug">
              ถ้ามีกลุ่มขนาดนั้นอยู่แล้ว ระบบจะบวกจำนวนเข้ากลุ่มเดิม ·
              ถ้าต้องการกลุ่มขนาดเดิมแต่น้ำหนักต่างกัน ให้กด <b>← กลับ</b> แล้วใช้ปุ่ม
              <b> + เพิ่มกลุ่มน้ำหนักอื่น ขนาดเดิม</b> ที่ใต้กลุ่มนั้น
            </p>
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
                onClick={async () => {
                  if (await ask('ใส่ข้อมูลตัวอย่าง?', 'ข้อมูลตัวอย่างจะแทนที่กลุ่มขนาดและจำนวนที่กรอกไว้ทั้งหมด', { okLabel: 'ใส่ข้อมูลตัวอย่าง' }))
                    onRows(DEMO_ROWS.map(makeRow));
                }}>ใส่ข้อมูลตัวอย่าง</button>
              <button type="button" className="text-navy-600 underline min-h-[36px]"
                onClick={() => setPaste(true)}>นำเข้าจาก Excel</button>
              <button type="button" className="text-danger underline min-h-[36px]"
                onClick={async () => { if (n === 0 || await ask('ล้างจำนวนพัสดุ?', 'จำนวนพัสดุทุกกลุ่มจะเปลี่ยนเป็น 0 ขนาดและน้ำหนักที่ตั้งไว้ยังอยู่ครบ', { okLabel: 'ล้างเป็น 0', danger: true })) onRows(rows.map(r => ({ ...r, qty: '0' }))); }}>
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
          พัสดุที่หนักต่ำกว่า 1 กก. ซึ่งรวมลงถุงกระสอบ อยู่นอกขอบเขตการคำนวณ และไม่ถูกนับในน้ำหนักรวมที่ระบบแสดง ·
          พัสดุที่ไม่ใช่ทรงสี่เหลี่ยมแต่ยังคงรูป ระบบประมาณด้วยกล่องครอบเล็กที่สุด
          <b className="text-warn"> ซึ่งเป็นการเผื่อพื้นที่ไม่ให้ชนกันเท่านั้น
          ผลการตรวจฐานรองรับและการวางซ้อนของพัสดุรูปทรงอื่น จึงยังไม่ยืนยันพื้นที่สัมผัสจริง</b>
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
