import { useEffect, useImperativeHandle, useRef, forwardRef, useState } from 'react';
import { Viewer3D } from '../lib/viewer3d';
import type { Box, Placed } from '../lib/pack';

export interface Viewer3DHandle {
  snapshot: () => string | null;
  redraw: () => void;
}

interface Props {
  box: Box;
  placed: Placed[];
  reserve: number;
  height: number;
  /** ซ่อนอยู่ (เช่นสลับแท็บ) จะไม่วาดใหม่ */
  active?: boolean;
  /** โหมดจำลอง: แสดงเฉพาะ n ชิ้นแรก (ไม่ใส่ = แสดงครบทุกชิ้น) */
  visibleCount?: number;
  label: string;
}

/** ห่อ three.js ด้วย component เดียว ใช้ renderer ตัวเดิมตลอดอายุ component */
const Viewer3DCanvas = forwardRef<Viewer3DHandle, Props>(function Viewer3DCanvas(
  { box, placed, reserve, height, active = true, visibleCount = -1, label }, ref,
) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const vRef = useRef<Viewer3D | null>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!cvRef.current) return;
    try {
      vRef.current = new Viewer3D(cvRef.current, height);
    } catch {
      setErr(true);
    }
    return () => { vRef.current?.dispose(); vRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!active) return;
    vRef.current?.draw(box, placed, reserve);
  }, [box, placed, reserve, active]);

  /* แยกจากการวาดใหม่โดยเด็ดขาด ไม่งั้นจะสร้างกล่องใหม่ทุกก้าว */
  useEffect(() => {
    if (!active) return;
    vRef.current?.setVisibleCount(visibleCount);
  }, [visibleCount, active, placed]);

  useImperativeHandle(ref, () => ({
    snapshot: () => vRef.current?.toDataURL() ?? null,
    redraw: () => vRef.current?.draw(box, placed, reserve),
  }), [box, placed, reserve]);

  if (err) {
    return <div className="lp-warn">แสดงภาพสามมิติไม่ได้ เบราว์เซอร์นี้อาจไม่รองรับ WebGL</div>;
  }
  return (
    <canvas
      ref={cvRef}
      height={height}
      aria-label={label}
      role="img"
      className="block w-full border border-navy-200 rounded-lg bg-[#fafbfc] touch-none"
    />
  );
});

export default Viewer3DCanvas;
