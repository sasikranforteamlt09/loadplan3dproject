/* ===== มุมมองรายผนังตามแนวลึก (canvas 2 มิติ) =====
   ย้ายมาจาก draw2d() ของรุ่นวานิลลา จัดกลุ่มตามค่า x เหมือนเดิม
   จำนวนช่องต่อแถวปรับตามความกว้างจอ เพื่อไม่ให้ข้อความซ้อนกันบนมือถือ */
import type { Box, Placed } from './pack';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

/** ตัดข้อความให้พอดีความกว้างที่มี */
function fit(g: CanvasRenderingContext2D, text: string, max: number): string {
  if (g.measureText(text).width <= max) return text;
  let t = text;
  while (t.length > 3 && g.measureText(t + '…').width > max) t = t.slice(0, -1);
  return t + '…';
}

export function drawWalls(cv: HTMLCanvasElement, box: Box, placed: Placed[]) {
  const xs = [...new Set(placed.map(p => +p.x.toFixed(1)))].sort((a, c) => a - c);
  const walls = xs.map(x => ({ x, items: placed.filter(p => +p.x.toFixed(1) === x) })).filter(w => w.items.length);

  const W = cv.clientWidth || 600; cv.width = W;
  /* จอแคบแสดงทีละช่อง จอกว้างค่อยแสดงหลายช่อง */
  const maxCols = W < 480 ? 1 : W < 760 ? 2 : 3;
  const cols = Math.min(maxCols, Math.max(1, walls.length));
  const rows = Math.ceil(walls.length / cols) || 1;

  const pad = W < 480 ? 16 : 34;
  const cw = (W - pad * (cols + 1)) / cols;
  const sc = cw / box.w, chh = box.h * sc;
  const rowH = chh + 56;
  cv.height = Math.max(220, rows * rowH + pad);

  const g = cv.getContext('2d');
  if (!g) return;
  g.fillStyle = '#f8fafc'; g.fillRect(0, 0, cv.width, cv.height);
  if (!walls.length) {
    g.fillStyle = '#475569'; g.font = `14px ${FONT}`;
    g.fillText('ยังไม่มีผลการจัดวาง', pad, 40);
    return;
  }

  walls.forEach((wl, i) => {
    const cx = pad + (i % cols) * (cw + pad);
    const cy = pad + 12 + Math.floor(i / cols) * rowH;

    g.fillStyle = '#0f172a'; g.font = `bold 13px ${FONT}`;
    const title = cols === 1
      ? `ผนังที่ ${i + 1} — ลึกจากหน้าตู้ ${wl.x} ซม. · ${wl.items.length} ชิ้น`
      : `ผนังที่ ${i + 1} · ลึก ${wl.x} ซม.`;
    g.fillText(fit(g, title, cw), cx, cy - 10);

    g.fillStyle = '#eef2f7'; g.fillRect(cx, cy, box.w * sc, chh);
    g.strokeStyle = '#334155'; g.lineWidth = 1.2; g.strokeRect(cx, cy, box.w * sc, chh);

    wl.items.forEach(p => {
      const px = cx + p.y * sc, py = cy + chh - (p.z + p.h) * sc;
      g.fillStyle = p.color || '#888'; g.fillRect(px, py, p.w * sc, p.h * sc);
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 0.8; g.strokeRect(px, py, p.w * sc, p.h * sc);
      if (p.w * sc > 22 && p.h * sc > 14) {
        g.fillStyle = '#fff'; g.font = `11px ${FONT}`;
        g.fillText(String(p.seq), px + 3, py + 12);
      }
    });

    /* ป้ายบอกด้าน แสดงเมื่อช่องกว้างพอเท่านั้น ไม่งั้นจะทับกัน */
    const bw = box.w * sc;
    g.fillStyle = '#475569'; g.font = `11px ${FONT}`;
    if (bw >= 150) {
      g.textAlign = 'left';  g.fillText('ผนังซ้าย', cx, cy + chh + 16);
      g.textAlign = 'right'; g.fillText('ผนังขวา', cx + bw, cy + chh + 16);
      g.textAlign = 'left';
    } else {
      g.textAlign = 'center';
      g.fillText('ซ้าย ← → ขวา', cx + bw / 2, cy + chh + 16);
      g.textAlign = 'left';
    }
  });
}
