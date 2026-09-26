/* ภาพกล่องสามมิติแบบไอโซเมตริก วาดตามสัดส่วนจริงของ ยาว x กว้าง x สูง
   ใช้แทนป้ายตัวอักษร เพื่อให้คนหน้างานเห็นรูปทรงกล่องได้ทันที */

interface Props {
  l: number;          // ยาว (ลึก)
  w: number;          // กว้าง
  h: number;          // สูง
  color: string;      // สีประจำกลุ่ม
  size?: number;      // ขนาดภาพเป็นพิกเซล
  className?: string;
}

/** ปรับสีให้สว่างขึ้น/มืดลง สำหรับหน้ากล่องแต่ละด้าน */
function shade(hex: string, amt: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v =>
    Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt)))),
  );
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

function BoxArt({ l, w, h, color, size = 40, className }: Props) {
  const L = Math.max(0.001, l || 1);
  const W = Math.max(0.001, w || 1);
  const H = Math.max(0.001, h || 1);

  /* ปรับให้กล่องใหญ่สุดเต็มกรอบพอดี โดยคงสัดส่วนจริงไว้ */
  const a = 0.866, b = 0.5;                   // ไอโซเมตริก 30 องศา
  const spanX = (W + L) * a;
  const spanY = (W + L) * b + H;
  const k = Math.min(78 / spanX, 78 / spanY); // กรอบวาดขนาด 100 หน่วย เว้นขอบ

  const ww = W * k, ll = L * k, hh = H * k;
  const ox = 50 + (ll - ww) * a * 0.5;
  const oy = 50 + ((ww + ll) * b + hh) * 0.5;

  const P = (x: number, y: number) => `${x.toFixed(2)},${y.toFixed(2)}`;
  const O = [ox, oy];                                   // มุมล่างหน้า
  const R = [ox + ww * a, oy - ww * b];                 // ขวาล่าง
  const Lf = [ox - ll * a, oy - ll * b];                // ซ้ายล่าง
  const B = [ox + ww * a - ll * a, oy - ww * b - ll * b]; // หลังล่าง
  const up = (p: number[]) => [p[0], p[1] - hh];

  const top = [up(O), up(R), up(B), up(Lf)];
  const right = [O, R, up(R), up(O)];
  const left = [O, Lf, up(Lf), up(O)];

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      style={{ display: 'block' }}
    >
      <polygon points={left.map(p => P(p[0], p[1])).join(' ')} fill={shade(color, -0.32)} />
      <polygon points={right.map(p => P(p[0], p[1])).join(' ')} fill={shade(color, -0.1)} />
      <polygon points={top.map(p => P(p[0], p[1])).join(' ')} fill={shade(color, 0.22)} />
      <g fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="1.1" strokeLinejoin="round">
        <polygon points={top.map(p => P(p[0], p[1])).join(' ')} />
        <polygon points={right.map(p => P(p[0], p[1])).join(' ')} />
        <polygon points={left.map(p => P(p[0], p[1])).join(' ')} />
      </g>
      {/* เส้นเทปกลางฝากล่อง */}
      <line
        x1={((up(O)[0] + up(Lf)[0]) / 2).toFixed(2)} y1={((up(O)[1] + up(Lf)[1]) / 2).toFixed(2)}
        x2={((up(R)[0] + up(B)[0]) / 2).toFixed(2)} y2={((up(R)[1] + up(B)[1]) / 2).toFixed(2)}
        stroke="rgba(255,255,255,.75)" strokeWidth="1.6"
      />
    </svg>
  );
}

export default BoxArt;

/** ภาพทรงกระบอกในกล่องครอบเล็กที่สุด ตามหัวข้อ 2.4.3 ของเล่ม
    เส้นประคือกล่องครอบที่ระบบใช้คำนวณจริง */
export function CylArt({ d, h, color, size = 40, className }: {
  d: number; h: number; color: string; size?: number; className?: string;
}) {
  const D = Math.max(0.001, d || 1);
  const H = Math.max(0.001, h || 1);
  const a = 0.866, b = 0.5;
  const spanX = 2 * D * a;
  const spanY = 2 * D * b + H;
  const k = Math.min(74 / spanX, 74 / spanY);
  const dd = D * k, hh = H * k;
  const rx = dd * a, ry = dd * b;
  const cx = 50, cyBottom = 50 + (2 * ry + hh) / 2 - ry;
  const cyTop = cyBottom - hh;

  const body = `M ${(cx - rx).toFixed(2)} ${cyTop.toFixed(2)}
                L ${(cx - rx).toFixed(2)} ${cyBottom.toFixed(2)}
                A ${rx.toFixed(2)} ${ry.toFixed(2)} 0 0 0 ${(cx + rx).toFixed(2)} ${cyBottom.toFixed(2)}
                L ${(cx + rx).toFixed(2)} ${cyTop.toFixed(2)} Z`;

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}
      aria-hidden="true" style={{ display: 'block' }}>
      <rect x={(cx - rx).toFixed(2)} y={(cyTop - ry).toFixed(2)}
        width={(rx * 2).toFixed(2)} height={(hh + ry * 2).toFixed(2)}
        fill="none" stroke="#94a3b8" strokeWidth="1.2" strokeDasharray="3 2.5" rx="1" />
      <path d={body} fill={shade(color, -0.16)} />
      <ellipse cx={cx} cy={cyTop.toFixed(2) as unknown as number} rx={rx} ry={ry} fill={shade(color, 0.24)} />
      <ellipse cx={cx} cy={cyTop.toFixed(2) as unknown as number} rx={rx} ry={ry}
        fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="1.1" />
      <path d={body} fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.1" />
    </svg>
  );
}

/** เลือกภาพตามรูปทรง */
export function ShapeArt({ shape, l, w, h, color, size, className }: {
  shape?: 'box' | 'cyl'; l: number; w: number; h: number; color: string; size?: number; className?: string;
}) {
  return shape === 'cyl'
    ? <CylArt d={Math.max(l, w)} h={h} color={color} size={size} className={className} />
    : <BoxArt l={l} w={w} h={h} color={color} size={size} className={className} />;
}
