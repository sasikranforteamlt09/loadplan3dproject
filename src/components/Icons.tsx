/* ไอคอนเส้นชุดเดียวของระบบ วาดเองทั้งหมด ไม่โหลดฟอนต์ไอคอนจากภายนอก */
type P = { className?: string; size?: number };
const base = (size = 22) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const, 'aria-hidden': true as const,
});

export const IcTruck = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M2 16V6.5A1.5 1.5 0 0 1 3.5 5H14v11" />
    <path d="M14 9h3.6a2 2 0 0 1 1.6.8L22 13.5V16" />
    <circle cx="7.5" cy="18" r="2" /><circle cx="17.5" cy="18" r="2" />
    <path d="M9.5 18H15.5M2 16h1.5M20 16h2" />
  </svg>
);

export const IcBox = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z" />
    <path d="M3.5 7 12 11.3 20.5 7M12 11.3v9.9" />
  </svg>
);

export const IcRuler = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="2.5" y="8" width="19" height="8" rx="1.6" />
    <path d="M6.5 8v3M10 8v4.5M13.5 8v3M17 8v4.5" />
  </svg>
);

export const IcStack = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 3 21 7.5 12 12 3 7.5z" /><path d="M3 12l9 4.5L21 12" /><path d="M3 16.5 12 21l9-4.5" />
  </svg>
);

export const IcCheck = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="m4.5 12.5 5 5 10-11" /></svg>
);

export const IcCheckCircle = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.8 2.8L16.2 9.5" />
  </svg>
);

export const IcAlert = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 4.5 21 19.5H3z" /><path d="M12 10v4M12 16.8v.2" />
  </svg>
);

export const IcWeight = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6.5 8h11l2 12h-15z" /><circle cx="12" cy="5.5" r="2.2" />
  </svg>
);

export const IcPercent = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M6 18 18 6" /><circle cx="7.5" cy="7.5" r="2.2" /><circle cx="16.5" cy="16.5" r="2.2" />
  </svg>
);

export const IcDepth = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M3 6v12M21 6v12M6 12h12" /><path d="m9 9-3 3 3 3M15 9l3 3-3 3" />
  </svg>
);

export const IcPrint = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M7 9V3.5h10V9" /><rect x="3.5" y="9" width="17" height="7" rx="1.6" />
    <rect x="7" y="14" width="10" height="6.5" rx="1" />
  </svg>
);

export const IcRotate = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9" /><path d="M20 4v4.5h-4.5" />
  </svg>
);

export const IcList = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.2M4.5 12h.2M4.5 17.5h.2" />
  </svg>
);

export const IcCube3D = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z" /><path d="M3.5 7 12 11.3 20.5 7M12 11.3v9.9" />
    <path d="M7.7 9.2v5.2l4.3 2.2" />
  </svg>
);

export const IcGrid = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.2" />
  </svg>
);

/** ภาพรถบรรทุกตู้ทึบ 4 ล้อ มุมมองด้านข้าง ใช้ในการ์ดเลือกรถ */
export const TruckArt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 56" className={className} aria-hidden="true">
    <rect x="4" y="9" width="70" height="33" rx="3" fill="currentColor" opacity=".16" />
    <rect x="4" y="9" width="70" height="33" rx="3" fill="none" stroke="currentColor" strokeWidth="2.4" />
    <path d="M12 9v33M22 9v33M32 9v33M42 9v33M52 9v33M62 9v33" stroke="currentColor" strokeWidth="1" opacity=".35" />
    <path d="M74 18h14l12 11v13H74z" fill="currentColor" opacity=".28" />
    <path d="M74 18h14l12 11v13H74z" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
    <path d="M78 22h9l7 7h-16z" fill="currentColor" opacity=".55" />
    <circle cx="24" cy="45" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
    <circle cx="88" cy="45" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.6" />
    <path d="M4 42h13M31 42h50M95 42h5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);

/** กล่องเส้นประ สำหรับตัวเลือกกำหนดขนาดเอง */
export const CustomArt = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 120 56" className={className} aria-hidden="true">
    <path d="M30 14 60 6l30 8v28l-30 8-30-8z" fill="currentColor" opacity=".12" />
    <path d="M30 14 60 6l30 8v28l-30 8-30-8z" fill="none" stroke="currentColor"
      strokeWidth="2.4" strokeDasharray="5 4" strokeLinejoin="round" />
    <path d="M30 14l30 8 30-8M60 22v28" fill="none" stroke="currentColor" strokeWidth="1.6" opacity=".6" />
  </svg>
);

export const IcCylinder = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <ellipse cx="12" cy="6.5" rx="6.5" ry="3" />
    <path d="M5.5 6.5v11a6.5 3 0 0 0 13 0v-11" />
  </svg>
);

export const IcPlay = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M7 4.5 19 12 7 19.5z" fill="currentColor" stroke="none" /></svg>
);
export const IcPause = ({ className, size }: P) => (
  <svg {...base(size)} className={className}>
    <rect x="6.5" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1" fill="currentColor" stroke="none" />
  </svg>
);
export const IcPrev = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M15 5.5 8 12l7 6.5" /></svg>
);
export const IcNext = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M9 5.5 16 12l-7 6.5" /></svg>
);
export const IcRewind = ({ className, size }: P) => (
  <svg {...base(size)} className={className}><path d="M18 5.5 11 12l7 6.5M7 5v14" /></svg>
);
