import { useEffect, useRef, useState } from 'react';
import Viewer3DCanvas, { type Viewer3DHandle } from './Viewer3DCanvas';
import { drawWalls } from '../lib/wallview';
import type { Plan } from '../pages/PlannerPage';

export default function Step3Result({ plan, onBack }: { plan: Plan; onBack: () => void }) {
  const [tab, setTab] = useState<'3d' | '2d'>('3d');
  const v3wrap = useRef<HTMLDivElement>(null);
  const v2wrap = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const viewer = useRef<Viewer3DHandle>(null);
  const wallCv = useRef<HTMLCanvasElement>(null);
  const r = plan;

  /* วาดมุมมองรายผนังเมื่อเปิดแท็บ และเมื่อขนาดหน้าจอเปลี่ยน */
  useEffect(() => {
    if (tab !== '2d' || !wallCv.current) return;
    const draw = () => wallCv.current && drawWalls(wallCv.current, r.box, r.placed);
    draw();
    window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, [tab, r]);

  /* เตรียมหน้าสำหรับพิมพ์
     ภาพ WebGL อาจพิมพ์ออกมาว่าง จึงแปลงภาพสามมิติเป็นรูปภาพก่อน
     และวาดมุมมองรายผนังให้พิมพ์ออกมาทั้งสองแบบเสมอ ไม่ขึ้นกับแท็บที่เปิดอยู่ */
  const preparePrint = () => {
    const a = v3wrap.current, b = v2wrap.current;
    if (!a || !b) return;
    const da = a.style.display, db = b.style.display;
    a.style.display = ''; b.style.display = '';
    viewer.current?.redraw();
    const url = viewer.current?.snapshot();
    if (url && imgRef.current) { imgRef.current.src = url; imgRef.current.hidden = false; a.classList.add('shot'); }
    else { a.classList.remove('shot'); }
    if (wallCv.current) drawWalls(wallCv.current, r.box, r.placed);
    a.style.display = da; b.style.display = db;
  };

  useEffect(() => {
    const after = () => v3wrap.current?.classList.remove('shot');
    window.addEventListener('beforeprint', preparePrint);
    window.addEventListener('afterprint', after);
    return () => {
      window.removeEventListener('beforeprint', preparePrint);
      window.removeEventListener('afterprint', after);
    };
  });

  const why: Record<string, number> = {};
  r.failed.forEach(f => { why[f.why] = (why[f.why] || 0) + 1; });
  const legend = new Map<string, string>();
  r.placed.forEach(p => { if (p.color) legend.set(p.name, p.color); });

  return (
    <div className="space-y-4">
      <section className="print-only hidden mb-3">
        <h1 className="text-[16px] font-bold">แผนการจัดวางพัสดุขึ้นพื้นที่บรรทุก</h1>
        <p className="text-[12px]">
          วันที่พิมพ์ {new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })} ·
          ขนาดภายในตู้ {r.box.l} × {r.box.w} × {r.box.h} ซม.
          {r.box.maxKg > 0 ? ` · น้ำหนักบรรทุกสูงสุด ${r.box.maxKg} กก.` : ''}
          {r.reserve ? ` · กันพื้นที่ท้ายรถให้ถุงกระสอบ ${r.reserve} ซม.` : ''}
        </p>
        <p className="text-[12px]">
          พัสดุทั้งหมด {r.placed.length + r.failed.length} ชิ้น · วางได้ {r.placed.length} ชิ้น ·
          วางไม่ได้ {r.failed.length} ชิ้น · น้ำหนักรวม {r.totalKg.toFixed(1)} กก. ·
          อัตราการใช้ประโยชน์ปริมาตร {r.U.toFixed(2)}%
        </p>
        <p className="text-[12px]">ผู้จัดทำแผน ....................................................</p>
      </section>

      <section className="lp-card p-4">
        <h2 className="lp-h2 mb-3">ผลการคำนวณ</h2>

        {r.failed.length ? (
          <div className="lp-warn mb-3">
            <b>มีพัสดุที่ระบบวางไม่ได้ {r.failed.length} ชิ้น</b><br />
            {Object.entries(why).map(e => e[0] + ' ' + e[1] + ' ชิ้น').join(' · ')}<br />
            แปลว่าพัสดุชุดนี้เกินความจุของพื้นที่บรรทุก ต้องแบ่งรอบหรือเพิ่มคันรถ
          </div>
        ) : (
          <div className="lp-ok mb-3">ระบบจัดวางพัสดุได้ครบทุกชิ้น ภายในพื้นที่บรรทุกที่กำหนด</div>
        )}

        <div className="kpigrid grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi id="kpi-n" v={r.placed.length + (r.failed.length ? ' / ' + (r.placed.length + r.failed.length) : '')} t="จำนวนชิ้นที่วางได้" />
          <Kpi v={r.U.toFixed(2) + '%'} t="อัตราการใช้ประโยชน์ปริมาตร (ตู้เต็มกี่ %)" />
          <Kpi v={r.box.maxKg > 0 ? r.totalKg.toFixed(1) + ' / ' + r.box.maxKg : r.totalKg.toFixed(1)}
            t={r.box.maxKg > 0 ? 'น้ำหนักรวม เทียบเพดานบรรทุก (กก.)' : 'น้ำหนักรวม (กก.)'} />
          <Kpi v={r.usedL.toFixed(1)} t="ความยาวที่ใช้ (ซม.)" />
        </div>

        {r.box.maxKg > 0 && (
          <div className="h-2.5 bg-line rounded-full overflow-hidden mt-3" aria-hidden="true">
            <i className={`block h-full ${r.totalKg > r.box.maxKg ? 'bg-danger' : 'bg-ok'}`}
              style={{ width: Math.min(100, (r.totalKg / r.box.maxKg) * 100) + '%' }} />
          </div>
        )}

        <details className="mt-3">
          <summary className="cursor-pointer text-[14px] text-navy-700 min-h-[44px] flex items-center">
            รายละเอียดสำหรับงานวิจัย
          </summary>
          <p className="lp-note mt-2">
            ปริมาตรพัสดุรวม {(r.volItems / 1e6).toFixed(3)} ลบ.ม. ·
            ปริมาตรพื้นที่บรรทุกที่ใช้ไปจริง {(r.volUsed / 1e6).toFixed(3)} ลบ.ม. ·
            น้ำหนักรวม {r.totalKg.toFixed(1)} กก.
            {r.reserve ? ` · กันพื้นที่ท้ายรถให้ถุงกระสอบ ${r.reserve} ซม.` : ''}
          </p>
          <p className="lp-note">
            <b>ปริมาตรว่างคงเหลือ (ไม่รวมพื้นที่ท้ายรถที่กันไว้) {(r.volFree / 1e6).toFixed(3)} ลบ.ม.</b>
            {' = '}{(r.volBoxZone > 0 ? (r.volFree / r.volBoxZone * 100).toFixed(1) : '0.0')}
            % ของปริมาตรพื้นที่บรรทุกที่ใช้วางได้ {(r.volBoxZone / 1e6).toFixed(3)} ลบ.ม.
            {r.volReserve > 0 ? ` · ปริมาตรพื้นที่ท้ายรถที่กันไว้ให้ถุงกระสอบ ${(r.volReserve / 1e6).toFixed(3)} ลบ.ม.` : ''}
          </p>
          <p className="lp-note">
            อัตราการใช้ประโยชน์ปริมาตร = ผลรวมปริมาตรพัสดุ ÷ (ความยาวที่ใช้ไปจริง × ความกว้างภายใน × ความสูงภายใน)
          </p>
          <p className="lp-note">
            เวลาที่ระบบใช้คำนวณ {r.ms < 1000 ? r.ms.toFixed(0) + ' มิลลิวินาที' : (r.ms / 1000).toFixed(2) + ' วินาที'}
          </p>
        </details>
      </section>

      <section className="lp-card p-4 plancard">
        <h2 className="lp-h2 mb-3">แผนการจัดวาง</h2>
        <div className="flex gap-2 mb-3 noprint" role="tablist" aria-label="รูปแบบการแสดงผล">
          <button type="button" role="tab" aria-selected={tab === '3d'} id="tab-3d" onClick={() => setTab('3d')}
            className={`lp-btn ${tab === '3d' ? 'bg-navy-700 text-white' : 'bg-navy-100 text-navy-700'}`}>มุมมองสามมิติ</button>
          <button type="button" role="tab" aria-selected={tab === '2d'} id="tab-2d" onClick={() => setTab('2d')}
            className={`lp-btn ${tab === '2d' ? 'bg-navy-700 text-white' : 'bg-navy-100 text-navy-700'}`}>มุมมองรายผนัง</button>
        </div>

        <div ref={v3wrap} className="printboth" style={{ display: tab === '3d' ? '' : 'none' }}>
          <Viewer3DCanvas ref={viewer} box={r.box} placed={r.placed} reserve={r.reserve} height={420}
            active={tab === '3d'} label="แผนการจัดวางพัสดุแบบสามมิติ" />
          <img ref={imgRef} hidden alt="ภาพแผนการจัดวางสามมิติ"
            className="w-full border border-navy-200 rounded-lg" />
          <p className="lp-note noprint mt-2">ลากเพื่อหมุน · หมุนล้อเมาส์เพื่อซูม</p>
        </div>
        <div ref={v2wrap} className="printboth mt-2" style={{ display: tab === '2d' ? '' : 'none' }}>
          <canvas ref={wallCv} height={420} role="img" aria-label="มุมมองรายผนังตามแนวลึก"
            className="block w-full border border-navy-200 rounded-lg bg-[#fafbfc]" />
        </div>

        <div className="flex flex-wrap gap-2 mt-3 text-[12.5px]">
          {[...legend].map(([name, color]) => (
            <span key={name} className="inline-flex items-center gap-1.5">
              <i aria-hidden="true" className="w-3 h-3 rounded-sm inline-block" style={{ background: color }} />{name}
            </span>
          ))}
        </div>
      </section>

      <section className="lp-card p-4 seqcard">
        <h2 className="lp-h2 mb-2">ลำดับการจัดวาง</h2>
        <p className="lp-note mb-2">
          ตำแหน่งวัดจากผนังหน้าตู้ ผนังซ้าย และพื้นตู้ · วางตามลำดับจากผนังหน้าตู้ออกมาทางประตูท้าย
          ชิ้นที่อยู่ด้านบนจะมาหลังชิ้นที่รองรับอยู่ด้านล่างเสมอ
        </p>
        <div className="seqwrap max-h-[420px] overflow-auto">
          <table id="seq" className="seqtable w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {['ลำดับ', 'พัสดุ', 'ขนาดที่วาง (ย×ก×ส ซม.)', 'ระยะจากหน้าตู้', 'ระยะจากผนังซ้าย', 'ความสูงจากพื้น', 'กก.'].map(h => (
                  <th key={h} className="sticky top-0 z-10 border border-navy-200 bg-navy-100 p-2 text-[13px] font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {r.placed.map(p => (
                <tr key={p.seq}>
                  <td className="border border-navy-200 p-1 text-center">{p.seq}</td>
                  <td className="border border-navy-200 p-1 text-left whitespace-nowrap">
                    <i aria-hidden="true" className="w-2.5 h-2.5 rounded-sm inline-block mr-1.5" style={{ background: p.color }} />
                    {p.name}
                  </td>
                  <td className="border border-navy-200 p-1 text-center">{p.l} × {p.w} × {p.h}</td>
                  <td className="border border-navy-200 p-1 text-center">{p.x.toFixed(1)}</td>
                  <td className="border border-navy-200 p-1 text-center">{p.y.toFixed(1)}</td>
                  <td className="border border-navy-200 p-1 text-center">{p.z.toFixed(1)}</td>
                  <td className="border border-navy-200 p-1 text-center">{p.kg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="lp-bar flex flex-col sm:flex-row justify-between gap-3 noprint">
        <button type="button" className="lp-btn-ghost" onClick={onBack}>← แก้จำนวนพัสดุ</button>
        <button type="button" id="btn-print" className="lp-btn-primary"
          onClick={() => { preparePrint(); window.print(); }}>พิมพ์แผนไปใช้หน้างาน</button>
      </div>
    </div>
  );
}

function Kpi({ v, t, id }: { v: string; t: string; id?: string }) {
  return (
    <div className="lp-kpi">
      <b id={id} className="block text-metric-sm sm:text-metric text-navy-800 tabular-nums">{v}</b>
      <span className="block mt-1 text-[13px] font-semibold text-muted leading-snug">{t}</span>
    </div>
  );
}
