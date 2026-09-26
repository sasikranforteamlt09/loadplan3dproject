/* ===== มุมมองสามมิติด้วย three.js (เรียกใช้โดยตรง ไม่ผ่าน wrapper ของ React) =====
   ย้ายมาจาก makeViewer() ของรุ่นวานิลลา คงพฤติกรรมเดิมทุกอย่าง
   ลากเพื่อหมุน · หมุนล้อเมาส์เพื่อซูม · ด้านที่มีเส้นสีแดงคือท้ายรถ (ประตู) */
import * as THREE from 'three';
import type { Box, Placed } from './pack';

// three รุ่นใหม่เปิดการจัดการสีแบบ sRGB เป็นค่าเริ่มต้น ปิดไว้เพื่อให้สีตรงกับรุ่นวานิลลา (r128)
THREE.ColorManagement.enabled = false;

export class Viewer3D {
  private ren: THREE.WebGLRenderer;
  private sc = new THREE.Scene();
  private cam = new THREE.PerspectiveCamera(42, 1, 1, 20000);
  private grp: THREE.Group | null = null;
  /** กล่องแต่ละชิ้นตามลำดับ placed (= ลำดับ seq) ใช้สำหรับโหมดจำลองการจัดวาง */
  private cubes: { mesh: THREE.Mesh; edge: THREE.LineSegments; mat: THREE.MeshLambertMaterial }[] = [];
  private shown = -1;   // -1 = แสดงทุกชิ้น (พฤติกรรมเดิม)
  private box: Box | null = null;
  private rotY = -0.7; private rotX = 0.45; private dist = 1.9;
  private drag = false; private lx = 0; private ly = 0;
  private cleanup: (() => void)[] = [];

  constructor(private cv: HTMLCanvasElement, private H: number) {
    this.ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, preserveDrawingBuffer: true }); // ให้พิมพ์/จับภาพได้
    this.ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.sc.background = new THREE.Color(0xfafbfc);
    this.sc.add(new THREE.AmbientLight(0xffffff, 0.72));
    const d1 = new THREE.DirectionalLight(0xffffff, 0.6); d1.position.set(1, 2, 1.4); this.sc.add(d1);
    const d2 = new THREE.DirectionalLight(0xffffff, 0.28); d2.position.set(-1, 0.6, -1); this.sc.add(d2);

    const down = (x: number, y: number) => { this.drag = true; this.lx = x; this.ly = y; };
    const move = (x: number, y: number) => {
      if (!this.drag) return;
      this.rotY += (x - this.lx) * 0.01;
      this.rotX = Math.max(-0.2, Math.min(1.4, this.rotX + (y - this.ly) * 0.01));
      this.lx = x; this.ly = y; this.render();
    };
    const onDown = (e: MouseEvent) => down(e.clientX, e.clientY);
    const onUp = () => { this.drag = false; };
    const onMove = (e: MouseEvent) => move(e.clientX, e.clientY);
    const onTS = (e: TouchEvent) => { const t = e.touches[0]; down(t.clientX, t.clientY); };
    const onTM = (e: TouchEvent) => { const t = e.touches[0]; move(t.clientX, t.clientY); e.preventDefault(); };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.dist = Math.max(0.8, Math.min(4, this.dist + (e.deltaY > 0 ? 0.12 : -0.12)));
      this.render();
    };
    const onResize = () => { if (this.box && this.cv.offsetParent) { this.resize(); this.render(); } };

    cv.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('mousemove', onMove);
    cv.addEventListener('touchstart', onTS, { passive: true });
    cv.addEventListener('touchmove', onTM, { passive: false });
    cv.addEventListener('touchend', onUp);
    cv.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('resize', onResize);
    this.cleanup.push(() => {
      cv.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('mousemove', onMove);
      cv.removeEventListener('touchstart', onTS);
      cv.removeEventListener('touchmove', onTM);
      cv.removeEventListener('touchend', onUp);
      cv.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
    });
  }

  private resize() {
    const w = this.cv.clientWidth || 600;
    this.ren.setSize(w, this.H, false);
    this.cam.aspect = w / this.H; this.cam.updateProjectionMatrix();
  }

  render() {
    if (!this.box) return;
    const b = this.box, R = Math.max(b.l, b.w, b.h) * this.dist;
    this.cam.position.set(
      Math.sin(this.rotY) * Math.cos(this.rotX) * R,
      Math.sin(this.rotX) * R + b.h * 0.3,
      Math.cos(this.rotY) * Math.cos(this.rotX) * R,
    );
    this.cam.lookAt(0, 0, 0);
    this.ren.render(this.sc, this.cam);
  }

  draw(b: Box, placed: Placed[], reserve: number) {
    this.resize();
    this.box = b;
    if (this.grp) { this.sc.remove(this.grp); disposeGroup(this.grp); }
    const G = new THREE.Group(), ox = -b.l / 2, oy = -b.h / 2, oz = -b.w / 2;
    G.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(b.l, b.h, b.w)),
      new THREE.LineBasicMaterial({ color: 0x33475b })));
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(b.l, b.w),
      new THREE.MeshBasicMaterial({ color: 0xdfe5ec, side: THREE.DoubleSide }));
    fl.rotation.x = -Math.PI / 2; fl.position.y = oy + 0.5; G.add(fl);

    /* ท้ายรถ (ประตู) อยู่ที่ x = ความยาวตู้ แสดงด้วยกรอบสีแดง */
    const dx = ox + b.l;
    G.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(dx, oy, oz), new THREE.Vector3(dx, oy, oz + b.w), new THREE.Vector3(dx, oy + b.h, oz + b.w),
      new THREE.Vector3(dx, oy + b.h, oz), new THREE.Vector3(dx, oy, oz)]),
      new THREE.LineBasicMaterial({ color: 0xd0342c })));

    if (!placed.length) {  /* ตู้เปล่า: ผนังโปร่งแสงให้เห็นรูปทรง */
      G.add(new THREE.Mesh(new THREE.BoxGeometry(b.l, b.h, b.w),
        new THREE.MeshLambertMaterial({ color: 0x9fb4c8, transparent: true, opacity: 0.18, side: THREE.BackSide })));
    }
    if (reserve > 0) {
      const zx = ox + (b.l - reserve);
      G.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(zx, oy, oz), new THREE.Vector3(zx, oy, oz + b.w), new THREE.Vector3(zx, oy + b.h, oz + b.w),
        new THREE.Vector3(zx, oy + b.h, oz), new THREE.Vector3(zx, oy, oz)]),
        new THREE.LineBasicMaterial({ color: 0xb4553f })));
    }
    this.cubes = [];
    placed.forEach(p => {
      const mat = new THREE.MeshLambertMaterial({ color: new THREE.Color(p.color) });
      const m = new THREE.Mesh(new THREE.BoxGeometry(p.l, p.h, p.w), mat);
      m.position.set(ox + p.x + p.l / 2, oy + p.z + p.h / 2, oz + p.y + p.w / 2);
      G.add(m);
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry),
        new THREE.LineBasicMaterial({ color: 0x1b2733, transparent: true, opacity: 0.35 }));
      e.position.copy(m.position); G.add(e);
      this.cubes.push({ mesh: m, edge: e, mat });
    });
    /* วาดใหม่ทุกครั้งต้องกลับไปแสดงครบทุกชิ้นเสมอ กันภาพพิมพ์ขาด */
    this.shown = -1;
    this.grp = G; this.sc.add(G); this.render();
  }

  /** จำนวนกล่องที่วางไว้แล้วทั้งหมด */
  count(): number { return this.cubes.length; }

  /** โหมดจำลอง: แสดงเฉพาะ n ชิ้นแรกตามลำดับการวางจริง (n < 0 = แสดงครบทุกชิ้น)
      ใช้การซ่อน/แสดงกล่องที่สร้างไว้แล้ว ไม่สร้างใหม่ จึงไม่หน่วงแม้มีนับพันชิ้น */
  setVisibleCount(n: number): void {
    if (n === this.shown) return;
    this.shown = n;
    const all = n < 0;
    this.cubes.forEach((c, i) => {
      const on = all || i < n;
      c.mesh.visible = on;
      c.edge.visible = on;
      /* ชิ้นล่าสุดที่เพิ่งวาง เน้นให้เรืองขึ้นมา */
      const last = !all && i === n - 1;
      c.mat.emissive.setHex(last ? 0x6b4a00 : 0x000000);
      (c.edge.material as THREE.LineBasicMaterial).opacity = last ? 1 : 0.35;
    });
    this.render();
  }

  /** ภาพนิ่งสำหรับการพิมพ์ (WebGL อาจพิมพ์ออกมาว่าง จึงแปลงเป็นรูปภาพก่อน) */
  toDataURL(): string | null {
    /* ต้องแสดงครบทุกชิ้นก่อนเสมอ ไม่งั้นภาพที่พิมพ์จะขาด */
    this.setVisibleCount(-1);
    try { return this.cv.toDataURL('image/png'); } catch { return null; }
  }

  dispose() {
    this.cleanup.forEach(f => f());
    if (this.grp) disposeGroup(this.grp);
    this.ren.dispose();
  }
}

function disposeGroup(g: THREE.Group) {
  g.traverse(o => {
    const any = o as THREE.Mesh;
    if (any.geometry) any.geometry.dispose();
    const m = any.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(m)) m.forEach(x => x.dispose()); else if (m) m.dispose();
  });
}
