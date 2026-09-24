/* ===== มุมมองรายผนังตามแนวลึก (canvas 2 มิติ) =====
   ย้ายมาจาก draw2d() ของรุ่นวานิลลา จัดกลุ่มตามค่า x เหมือนเดิม */
import type { Box, Placed } from './pack';

const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';

export function drawWalls(cv: HTMLCanvasElement, box: Box, placed: Placed[]) {
  const xs = [...new Set(placed.map(p => +p.x.toFixed(1)))].sort((a, c) => a - c);
  const walls = xs.map(x => ({ x, items: placed.filter(p => +p.x.toFixed(1) === x) })).filter(w => w.items.length);
  const cols = Math.min(3, Math.max(1, walls.length)), rows = Math.ceil(walls.length / cols) || 1;
  const W = cv.clientWidth || 600; cv.width = W;
  const pad = 34, cw = (W - pad * (cols + 1)) / cols, sc = cw / box.w, chh = box.h * sc;
  cv.height = Math.max(220, rows * (chh + 52) + pad);
  const g = cv.getContext('2d');
  if (!g) return;
  g.fillStyle = '#fafbfc'; g.fillRect(0, 0, cv.width, cv.height);
  if (!walls.length) {
    g.fillStyle = '#5b6d80'; g.font = `14px ${FONT}`;
    g.fillText('ยังไม่มีผลการจัดวาง', pad, 40);
    return;
  }
  walls.forEach((wl, i) => {
    const cx = pad + (i % cols) * (cw + pad), cy = pad + Math.floor(i / cols) * (chh + 52);
    g.fillStyle = '#16202b'; g.font = `13px ${FONT}`;
    g.fillText('ผนังที่ ' + (i + 1) + ' — ลึกจากหน้าตู้ ' + wl.x + ' ซม.', cx, cy - 9);
    g.fillStyle = '#eef1f5'; g.fillRect(cx, cy, box.w * sc, chh);
    g.strokeStyle = '#33475b'; g.lineWidth = 1.2; g.strokeRect(cx, cy, box.w * sc, chh);
    wl.items.forEach(p => {
      const px = cx + p.y * sc, py = cy + chh - (p.z + p.h) * sc;
      g.fillStyle = p.color || '#888'; g.fillRect(px, py, p.w * sc, p.h * sc);
      g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 0.8; g.strokeRect(px, py, p.w * sc, p.h * sc);
      if (p.w * sc > 22 && p.h * sc > 14) {
        g.fillStyle = '#fff'; g.font = `11px ${FONT}`;
        g.fillText(String(p.seq), px + 3, py + 12);
      }
    });
    g.fillStyle = '#5b6d80'; g.font = `11px ${FONT}`;
    g.fillText('ผนังซ้าย', cx, cy + chh + 14);
    g.fillText('ผนังขวา', cx + box.w * sc - 34, cy + chh + 14);
  });
}
