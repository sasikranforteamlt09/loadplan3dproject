import { useState } from 'react';
import { makeRow, DEMO_ROWS, type GroupRow } from '../pages/PlannerPage';
import type { Box } from '../lib/pack';

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

  const set = (id: number, k: keyof GroupRow, v: string) =>
    onRows(rows.map(r => (r.id === id ? { ...r, [k]: v } : r)));
  const bump = (id: number, d: number) =>
    onRows(rows.map(r => (r.id === id ? { ...r, qty: String(Math.max(0, (Math.round(+r.qty) || 0) + d)) } : r)));

  const n = rows.reduce((s, r) => s + (Math.round(+r.qty) || 0), 0);
  const v = rows.reduce((s, r) => s + (Math.round(+r.qty) || 0) * (+r.l || 0) * (+r.w || 0) * (+r.h || 0), 0);
  const cap = box.l * box.w * box.h;
  /* กลุ่มที่ใหญ่กว่าตู้ ไม่ว่าจะหมุนอย่างไรก็วางไม่ได้ */
  const bd = [box.l, box.w, box.h].sort((a, b) => a - b);
  const oversize = rows
    .filter(r => {
      const d = [+r.l || 0, +r.w || 0, +r.h || 0].sort((a, b) => a - b);
      return d[2] > 0 && (Math.round(+r.qty) || 0) > 0 && (d[0] > bd[0] || d[1] > bd[1] || d[2] > bd[2]);
    })
    .map(r => r.name);
  const p = cap > 0 ? (v / cap) * 100 : 0;

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
      <section className="lp-card p-4">
        <h2 className="lp-h2 mb-2">จำนวนพัสดุแต่ละกลุ่มขนาดในกองพัก ณ เวลาเริ่มจัดวาง</h2>
        <p className="lp-note mb-3">
          ขนาดของแต่ละกลุ่มวัดไว้ล่วงหน้า · ที่หน้างานกด + / − เพื่อนับจำนวนได้เลย ·
          บนมือถือช่องขนาดจะถูกซ่อน ให้แก้ขนาดบนคอมพิวเตอร์
        </p>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full border-collapse text-[14px]">
            <thead>
              <tr>
                <th className="border border-navy-200 bg-navy-50 p-1.5 text-[13px] min-w-[120px]">กลุ่มขนาด</th>
                <th className="hidden md:table-cell border border-navy-200 bg-navy-50 p-1.5 text-[13px]">ยาว</th>
                <th className="hidden md:table-cell border border-navy-200 bg-navy-50 p-1.5 text-[13px]">กว้าง</th>
                <th className="hidden md:table-cell border border-navy-200 bg-navy-50 p-1.5 text-[13px]">สูง</th>
                <th className="hidden md:table-cell border border-navy-200 bg-navy-50 p-1.5 text-[13px]">กก./ชิ้น</th>
                <th className="border border-navy-200 bg-navy-50 p-1.5 text-[13px] min-w-[160px]">จำนวนในกอง</th>
                <th className="hidden md:table-cell border border-navy-200 bg-navy-50 p-1.5 text-[13px]"><span className="sr-only">ลบ</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td className="border border-navy-200 p-1.5 text-left align-top">
                    <div className="flex items-center gap-1.5">
                      <span aria-hidden="true" className="w-3 h-3 rounded-sm shrink-0" style={{ background: r.color }} />
                      <input aria-label={`ชื่อกลุ่มขนาด ${r.name}`} className="lp-input !min-h-[40px] px-2 py-1"
                        value={r.name} onChange={e => set(r.id, 'name', e.target.value)} />
                    </div>
                    <div className="md:hidden flex items-center justify-between gap-2 mt-1 ml-[18px]">
                      <span className="text-[12px] text-muted">
                        {r.l || 0}×{r.w || 0}×{r.h || 0} ซม. · {r.kg || 0} กก.
                      </span>
                      <button type="button" onClick={() => onRows(rows.filter(x => x.id !== r.id))}
                        aria-label={`ลบกลุ่ม ${r.name}`}
                        className="min-h-[44px] min-w-[44px] px-2 rounded-lg border border-[#d9b3a9] text-danger bg-white
                                   text-[13px] hover:bg-[#fff6f4] shrink-0">ลบ</button>
                    </div>
                  </td>
                  {(['l', 'w', 'h', 'kg'] as const).map(k => (
                    <td key={k} className="hidden md:table-cell border border-navy-200 p-1">
                      <input type="number" step="0.1" inputMode="decimal"
                        aria-label={`${({ l: 'ยาว', w: 'กว้าง', h: 'สูง', kg: 'น้ำหนักต่อชิ้น' } as const)[k]} ของ ${r.name}`}
                        className="lp-input !min-h-[40px] px-1 text-center w-[72px]"
                        value={r[k]} onChange={e => set(r.id, k, e.target.value)} />
                    </td>
                  ))}
                  <td className="border border-navy-200 p-1">
                    <div className="flex items-center justify-center gap-1.5">
                      <button type="button" aria-label={`ลดจำนวน ${r.name}`} onClick={() => bump(r.id, -1)}
                        className="w-11 h-11 rounded-lg bg-navy-100 text-navy-700 text-xl font-bold leading-none
                                   hover:bg-navy-200 active:bg-navy-300">−</button>
                      <input type="number" min={0} step={1} inputMode="numeric"
                        aria-label={`จำนวนของ ${r.name}`}
                        className="lp-input !min-h-[44px] w-[64px] text-center font-bold text-[16px] px-1"
                        value={r.qty} onChange={e => set(r.id, 'qty', e.target.value)} />
                      <button type="button" aria-label={`เพิ่มจำนวน ${r.name}`} onClick={() => bump(r.id, 1)}
                        className="w-11 h-11 rounded-lg bg-navy-100 text-navy-700 text-xl font-bold leading-none
                                   hover:bg-navy-200 active:bg-navy-300">+</button>
                    </div>
                  </td>
                  <td className="hidden md:table-cell border border-navy-200 p-1">
                    <button type="button" onClick={() => onRows(rows.filter(x => x.id !== r.id))}
                      aria-label={`ลบกลุ่ม ${r.name}`}
                      className="min-h-[44px] min-w-[44px] px-2 rounded-lg border border-[#d9b3a9] text-danger bg-white
                                 text-[13px] hover:bg-[#fff6f4]">ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button type="button" className="lp-btn-ghost" onClick={() => onRows([...rows, makeRow({}, rows.length)])}>
            + เพิ่มกลุ่มขนาด
          </button>
          <button type="button" id="btn-demo" className="lp-btn-ghost"
            onClick={() => onRows(DEMO_ROWS.map(makeRow))}>ใส่ข้อมูลตัวอย่าง</button>
          <button type="button" className="lp-btn-ghost"
            onClick={() => { if (n === 0 || window.confirm('ล้างจำนวนพัสดุทุกกลุ่มเป็น 0 ใช่หรือไม่')) onRows(rows.map(r => ({ ...r, qty: '0' }))); }}>ล้างจำนวนเป็น 0</button>
          <button type="button" className="lp-btn-ghost" aria-expanded={paste}
            onClick={() => setPaste(x => !x)}>วางจาก Excel</button>
        </div>

        {paste && (
          <div className="mt-3">
            <label className="lp-label" htmlFor="pasteTa">
              คัดลอกจาก Excel แล้ววางที่นี่ (คอลัมน์: ชื่อ ยาว กว้าง สูง น้ำหนัก จำนวน)
            </label>
            <textarea id="pasteTa" rows={4} value={pasteTxt} onChange={e => setPasteTxt(e.target.value)}
              className="w-full border border-navy-200 rounded-lg p-2 font-mono text-[12px]" />
            <button type="button" className="lp-btn-ghost mt-2" onClick={doPaste}>นำเข้า</button>
          </div>
        )}

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <div className="lp-kpi"><b className="block text-[21px] text-navy-700">{n}</b><span className="text-[12.5px] text-muted">พัสดุรวม (ชิ้น)</span></div>
          <div className="lp-kpi"><b className="block text-[21px] text-navy-700">{(v / 1e6).toFixed(2)}</b><span className="text-[12.5px] text-muted">ปริมาตรพัสดุรวม (ลบ.ม.)</span></div>
          <div className="lp-kpi">
            <b className="block text-[21px] text-navy-700">{p.toFixed(0)}%</b>
            <span className="text-[12.5px] text-muted">เทียบกับปริมาตรตู้</span>
            <div className="h-2.5 bg-line rounded-full overflow-hidden mt-1.5">
              <i className={`block h-full ${p > 100 ? 'bg-danger' : 'bg-ok'}`} style={{ width: Math.min(100, p) + '%' }} />
            </div>
          </div>
        </div>
        {oversize.length > 0 && (
          <p className="lp-warn">
            กลุ่ม {oversize.join(' · ')} มีขนาดใหญ่กว่าพื้นที่บรรทุก ระบบจะวางไม่ได้ ตรวจดูว่ากรอกตัวเลขถูกหรือไม่
          </p>
        )}
        {p > 100 && (
          <p className="lp-warn">ปริมาตรพัสดุรวมมากกว่าปริมาตรตู้ อาจมีพัสดุบางส่วนที่ระบบวางไม่ได้</p>
        )}
        <p className="lp-note mt-2">พัสดุที่หนักต่ำกว่า 1 กก. ซึ่งรวมลงถุงกระสอบ อยู่นอกขอบเขตการคำนวณ</p>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button type="button" className="lp-btn-ghost" onClick={onBack}>← กลับไปเลือกรถ</button>
        <div className="flex flex-col sm:items-end gap-1">
          {n === 0 && <span className="text-[13px] text-muted">ยังไม่ได้ใส่จำนวนพัสดุ</span>}
          <button type="button" id="btn-run" className="lp-btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
            disabled={n === 0} onClick={onRun}>คำนวณแผนการจัดวาง →</button>
        </div>
      </div>
    </div>
  );
}
