import { useEffect, useRef, useState } from 'react';
import Viewer3DCanvas, { type Viewer3DHandle } from './Viewer3DCanvas';
import { IcCheckCircle, IcAlert, IcBox, IcPercent, IcWeight, IcDepth, IcCube3D, IcList, IcPrint,
  IcPlay, IcPause, IcPrev, IcNext, IcRewind } from './Icons';
import { drawWalls } from '../lib/wallview';
import type { Plan } from '../pages/PlannerPage';

export default function Step3Result({ plan, onBack }: { plan: Plan; onBack: () => void }) {
  const [tab, setTab] = useState<'3d' | '2d'>('3d');
  /* โหมดจำลองการจัดวาง: แสดงทีละชิ้นตามลำดับที่ pack() คำนวณไว้ ไม่มีการจัดลำดับใหม่ */
  const [simOn, setSimOn] = useState(false);
  const [simIdx, setSimIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const rowRefs = useRef<Record<number, HTMLTableRowElement | null>>({});
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
    /* กันภาพพิมพ์ขาด: ปิดโหมดจำลองและแสดงกล่องครบทุกชิ้นก่อนจับภาพเสมอ */
    setPlaying(false); setSimOn(false);
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

  /* เดินหน้าอัตโนมัติ 2 ชิ้นต่อวินาที หยุดเองเมื่อถึงชิ้นสุดท้าย */
  useEffect(() => {
    if (!playing || !simOn) return;
    const id = window.setInterval(() => {
      setSimIdx(i => {
        if (i >= plan.placed.length) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 500);
    return () => window.clearInterval(id);
  }, [playing, simOn, plan.placed.length]);

  /* ปิดโหมดจำลองเมื่อออกจากแท็บสามมิติ หรือเมื่อผลลัพธ์เปลี่ยน */
  useEffect(() => { if (tab !== '3d') { setSimOn(false); setPlaying(false); } }, [tab]);
  useEffect(() => { setSimOn(false); setPlaying(false); setSimIdx(0); }, [plan]);

  /* เลื่อนตารางลำดับตามชิ้นที่กำลังแสดง */
  useEffect(() => {
    if (!simOn || simIdx < 1) return;
    rowRefs.current[simIdx]?.scrollIntoView({ block: 'nearest' });
  }, [simIdx, simOn]);

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
        {r.failed.length ? (
          <div className="flex gap-3 items-start bg-danger-bg border-1.5 border-danger/30 rounded-card p-3.5 mb-3.5">
            <span className="text-danger shrink-0 mt-0.5"><IcAlert size={24} /></span>
            <p className="text-[14px] leading-snug text-ink m-0">
              <b className="text-[15.5px]">มีพัสดุที่ระบบวางไม่ได้ {r.failed.length} ชิ้น</b><br />
              {Object.entries(why).map(e => e[0] + ' ' + e[1] + ' ชิ้น').join(' · ')}<br />
              แปลว่าพัสดุชุดนี้เกินความจุของพื้นที่บรรทุก ต้องแบ่งรอบหรือเพิ่มคันรถ
            </p>
          </div>
        ) : (
          <div className="flex gap-3 items-center bg-ok-bg border-1.5 border-ok/30 rounded-card p-3.5 mb-3.5">
            <span className="text-ok shrink-0"><IcCheckCircle size={26} /></span>
            <p className="text-[15.5px] font-bold leading-snug text-ink m-0">
              จัดวางได้ครบทุกชิ้น
              <span className="block text-[13px] font-normal text-muted">พัสดุทั้งหมดอยู่ในพื้นที่บรรทุกที่กำหนด</span>
            </p>
          </div>
        )}

        <div className="kpigrid grid grid-cols-2 lg:grid-cols-4 gap-2.5">
          <Kpi id="kpi-n" ico={<IcBox size={18} />}
            v={r.placed.length + (r.failed.length ? ' / ' + (r.placed.length + r.failed.length) : '')} t="จำนวนชิ้นที่วางได้" />
          <Kpi ico={<IcPercent size={18} />} v={r.U.toFixed(2) + '%'} t="อัตราการใช้ประโยชน์ปริมาตร" />
          <Kpi ico={<IcWeight size={18} />}
            v={r.box.maxKg > 0 ? r.totalKg.toFixed(1) + ' / ' + r.box.maxKg : r.totalKg.toFixed(1)}
            t={r.box.maxKg > 0 ? 'น้ำหนักรวม เทียบเพดาน (กก.)' : 'น้ำหนักรวม (กก.)'} />
          <Kpi ico={<IcDepth size={18} />} v={r.usedL.toFixed(1)} t="ความยาวที่ใช้ (ซม.)" />
        </div>

        {r.box.maxKg > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-[13px] font-semibold mb-1.5">
              <span className="text-muted">น้ำหนักเทียบเพดานบรรทุก</span>
              <span className={r.totalKg > r.box.maxKg ? 'text-danger' : 'text-ok'}>
                {((r.totalKg / r.box.maxKg) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="lp-gauge" aria-hidden="true">
              <i className={`block h-full rounded-pill ${r.totalKg > r.box.maxKg ? 'bg-danger' : 'bg-ok'}`}
                style={{ width: Math.min(100, (r.totalKg / r.box.maxKg) * 100) + '%' }} />
            </div>
          </div>
        )}

        <details className="mt-3.5 border-t border-line pt-2">
          <summary className="cursor-pointer text-[14px] font-semibold text-navy-700 min-h-[44px] flex items-center">
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
        <div className="lp-sect">
          <span className="lp-sect-ico"><IcCube3D /></span>
          <span className="lp-sect-t">
            แผนการจัดวาง
            <span className="lp-sect-s">ลากเพื่อหมุน · หมุนล้อเมาส์เพื่อซูม</span>
          </span>
        </div>
        <div className="inline-flex gap-1 p-1 mb-3 rounded-pill bg-navy-100 noprint"
          role="tablist" aria-label="รูปแบบการแสดงผล">
          <button type="button" role="tab" aria-selected={tab === '3d'} id="tab-3d" onClick={() => setTab('3d')}
            className={`min-h-[42px] px-4 rounded-pill text-[14.5px] font-bold transition
              ${tab === '3d' ? 'bg-navy-800 text-white shadow-pop' : 'text-navy-700'}`}>มุมมองสามมิติ</button>
          <button type="button" role="tab" aria-selected={tab === '2d'} id="tab-2d" onClick={() => setTab('2d')}
            className={`min-h-[42px] px-4 rounded-pill text-[14.5px] font-bold transition
              ${tab === '2d' ? 'bg-navy-800 text-white shadow-pop' : 'text-navy-700'}`}>ดูทีละด้าน</button>
        </div>

        <div ref={v3wrap} className="printboth" style={{ display: tab === '3d' ? '' : 'none' }}>
          <Viewer3DCanvas ref={viewer} box={r.box} placed={r.placed} reserve={r.reserve} height={420}
            active={tab === '3d'} visibleCount={simOn ? simIdx : -1}
            label="แผนการจัดวางพัสดุแบบสามมิติ" />
          <img ref={imgRef} hidden alt="ภาพแผนการจัดวางสามมิติ"
            className="w-full border border-navy-200 rounded-lg" />

          {!simOn ? (
            <div className="noprint mt-2.5 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
              <p className="lp-note m-0">ลากเพื่อหมุน · หมุนล้อเมาส์เพื่อซูม</p>
              <button type="button" className="lp-btn-outline !min-h-[46px] !text-[14.5px]"
                onClick={() => { setSimOn(true); setSimIdx(0); }}>
                <IcPlay size={18} /> ดูลำดับการจัดวางทีละชิ้น
              </button>
            </div>
          ) : (
            <div className="noprint mt-2.5 rounded-card border-1.5 border-brand-300 bg-brand-50/60 p-3">
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <b className="text-[15px] text-ink tabular-nums">
                  ชิ้นที่ {simIdx.toLocaleString('th-TH')} / {r.placed.length.toLocaleString('th-TH')}
                </b>
                <button type="button" className="lp-btn-outline !min-h-[38px] !text-[13px] px-3"
                  onClick={() => { setSimOn(false); setPlaying(false); }}>ปิดโหมดจำลอง</button>
              </div>

              <input type="range" min={0} max={r.placed.length} value={simIdx}
                aria-label="เลื่อนดูลำดับการจัดวาง"
                onChange={e => { setPlaying(false); setSimIdx(+e.target.value); }}
                className="w-full accent-brand-500 h-6" />

              <div className="flex items-center justify-center gap-2 mt-1.5">
                <button type="button" aria-label="กลับไปเริ่มต้น" className="lp-sim-btn"
                  onClick={() => { setPlaying(false); setSimIdx(0); }}><IcRewind size={20} /></button>
                <button type="button" aria-label="ย้อนหนึ่งชิ้น" className="lp-sim-btn"
                  onClick={() => { setPlaying(false); setSimIdx(i => Math.max(0, i - 1)); }}><IcPrev size={20} /></button>
                <button type="button" aria-label={playing ? 'หยุด' : 'เล่น'}
                  className="lp-sim-btn !w-14 !h-14 bg-brand-500 text-navy-900 border-brand-500"
                  onClick={() => setPlaying(p => !p)}>
                  {playing ? <IcPause size={24} /> : <IcPlay size={24} />}
                </button>
                <button type="button" aria-label="ถัดไปหนึ่งชิ้น" className="lp-sim-btn"
                  onClick={() => { setPlaying(false); setSimIdx(i => Math.min(r.placed.length, i + 1)); }}><IcNext size={20} /></button>
                <button type="button" aria-label="ไปชิ้นสุดท้าย" className="lp-sim-btn"
                  onClick={() => { setPlaying(false); setSimIdx(r.placed.length); }}><IcRewind size={20} className="rotate-180" /></button>
              </div>

              {simIdx > 0 && r.placed[simIdx - 1] && (
                <p className="text-[13.5px] text-ink m-0 mt-2.5 leading-snug">
                  <span aria-hidden="true" className="inline-block w-3 h-3 rounded-sm mr-1.5 align-middle"
                    style={{ background: r.placed[simIdx - 1].color }} />
                  <b>{r.placed[simIdx - 1].name}</b> · ลึกจากหน้าตู้ {r.placed[simIdx - 1].x.toFixed(0)} ซม. ·
                  จากผนังซ้าย {r.placed[simIdx - 1].y.toFixed(0)} ซม. ·
                  สูงจากพื้น {r.placed[simIdx - 1].z.toFixed(0)} ซม.
                </p>
              )}
              <p className="text-[12px] text-muted m-0 mt-1.5 leading-snug">
                ลำดับนี้คือลำดับที่ขั้นตอนวิธีคำนวณไว้ ชิ้นด้านบนมาหลังชิ้นที่รองรับเสมอ
              </p>
            </div>
          )}
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
        <div className="lp-sect">
          <span className="lp-sect-ico"><IcList /></span>
          <span className="lp-sect-t">
            ลำดับการจัดวาง
            <span className="lp-sect-s">{r.placed.length.toLocaleString('th-TH')} ชิ้น เรียงตามลำดับที่ต้องวางจริง</span>
          </span>
        </div>
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
                <tr key={p.seq}
                  ref={el => { rowRefs.current[p.seq] = el; }}
                  onClick={() => { if (simOn) { setPlaying(false); setSimIdx(p.seq); } }}
                  className={simOn && p.seq === simIdx ? 'bg-brand-100 font-bold' : simOn ? 'cursor-pointer' : ''}>
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
          onClick={() => { preparePrint(); window.print(); }}>
          <IcPrint size={20} /> พิมพ์แผนไปใช้หน้างาน
        </button>
      </div>
    </div>
  );
}

function Kpi({ v, t, id, ico }: { v: string; t: string; id?: string; ico?: React.ReactNode }) {
  return (
    <div className="lp-stat">
      {ico && <span className="lp-stat-ico">{ico}</span>}
      <b id={id} className="block text-metric-sm sm:text-metric text-navy-800 tabular-nums leading-none">{v}</b>
      <span className="block mt-1.5 text-[12.5px] font-semibold text-muted leading-snug">{t}</span>
    </div>
  );
}
