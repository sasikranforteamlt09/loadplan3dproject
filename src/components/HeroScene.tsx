import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { pack } from '../lib/pack';

THREE.ColorManagement.enabled = false;

/* ภาพสามมิติในหัวหน้าแรก: คำนวณจริงด้วย pack() แล้วค่อย ๆ วางทีละชิ้น */
export default function HeroScene() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    let ren: THREE.WebGLRenderer;
    try { ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); }
    catch { return; }
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(38, 1, 1, 20000);
    sc.add(new THREE.AmbientLight(0xffffff, 0.65));
    const d = new THREE.DirectionalLight(0xffffff, 0.7); d.position.set(1, 2, 1.2); sc.add(d);
    const d2 = new THREE.DirectionalLight(0x88aaff, 0.25); d2.position.set(-1, 0.5, -1); sc.add(d2);

    const box = { l: 300, w: 170, h: 180, maxKg: 0 };
    const cols = ['#f59e0b', '#3f86c2', '#5fb37c', '#fac278', '#8b6fd1', '#2fb3a6'];
    const items = [
      { name: 'A', l: 40, w: 60, h: 40, kg: 18, qty: 6 }, { name: 'B', l: 24, w: 40, h: 17, kg: 8, qty: 18 },
      { name: 'C', l: 22, w: 35, h: 14, kg: 5, qty: 26 }, { name: 'D', l: 20, w: 30, h: 11, kg: 3.5, qty: 34 },
      { name: 'E', l: 17, w: 25, h: 9, kg: 2, qty: 40 }, { name: 'F', l: 14, w: 20, h: 6, kg: 1.2, qty: 44 },
    ].map((o, i) => ({ ...o, color: cols[i] }));
    const r = pack(items, box, { allowRotate: true, rearReserve: 0 });
    const ox = -box.l / 2, oy = -box.h / 2, oz = -box.w / 2;
    const root = new THREE.Group(); sc.add(root);
    root.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(box.l, box.h, box.w)),
      new THREE.LineBasicMaterial({ color: 0x7fa3c6, transparent: true, opacity: 0.8 })));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(box.l, box.w),
      new THREE.MeshBasicMaterial({ color: 0x1d3f60, side: THREE.DoubleSide }));
    fl.rotation.x = -Math.PI / 2; fl.position.y = oy + 0.3; root.add(fl);

    const meshes = r.placed.map(p => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(p.l - 0.6, p.h - 0.6, p.w - 0.6),
        new THREE.MeshLambertMaterial({ color: new THREE.Color(p.color) }));
      m.userData.y = oy + p.z + p.h / 2;
      m.position.set(ox + p.x + p.l / 2, m.userData.y + 120, oz + p.y + p.w / 2);
      m.visible = false; root.add(m); return m;
    });

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let t0 = performance.now(), ang = -0.8, raf = 0, last = -1;
    const size = () => {
      const w = cv.clientWidth, h = cv.clientHeight || 1;
      ren.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    window.addEventListener('resize', size); size();

    const frame = (now: number) => {
      const per = 28, t = reduce ? 1e9 : now - t0, k0 = Math.min(meshes.length, Math.floor(t / per));
      meshes.forEach((m, i) => {
        if (i < k0) { m.visible = true; const k = Math.min(1, (t - i * per) / 380); m.position.y = m.userData.y + 120 * Math.pow(1 - k, 3); }
        else m.visible = false;
      });
      if (k0 !== last) { last = k0; setShown(k0); }
      if (!reduce && t > meshes.length * per + 3500) t0 = now;
      if (!reduce) ang += 0.0022;
      const R = 520; cam.position.set(Math.sin(ang) * R, 250, Math.cos(ang) * R); cam.lookAt(0, -20, 0);
      ren.render(sc, cam);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', size);
      ren.dispose();
    };
  }, []);

  return (
    <div className="relative h-[320px] md:h-[440px]">
      <canvas ref={cvRef} className="w-full h-full block" role="img"
        aria-label="ภาพจำลองการจัดวางพัสดุในตู้บรรทุกแบบสามมิติ" />
      <div className="absolute top-2 right-2 bg-navy-900/70 border border-white/15 rounded-lg px-3 py-2 text-[13px] text-navy-200">
        <b className="block text-white text-[18px] font-bold">{shown}</b>ชิ้นที่วางแล้ว
      </div>
      <div className="absolute inset-x-0 bottom-1 text-center text-[13px] text-navy-300">
        ภาพจำลองจากข้อมูลตัวอย่าง คำนวณจริงในเบราว์เซอร์ขณะนี้
      </div>
    </div>
  );
}
