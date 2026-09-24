const LABELS = ['เลือกรถ', 'นับพัสดุในกองพัก', 'แผนการจัดวาง'];
/* ป้ายสั้นสำหรับจอแคบ กันข้อความตัดบรรทัดจนแถบสูงเกินไป */
const SHORT = ['เลือกรถ', 'นับพัสดุ', 'แผนจัดวาง'];

export default function Stepper({ step, maxStep, onGo }: { step: number; maxStep: number; onGo: (n: number) => void }) {
  return (
    <nav aria-label="ขั้นตอนการใช้งาน" className="flex bg-white rounded-xl2 shadow-card overflow-hidden mb-4 noprint">
      {LABELS.map((t, i) => {
        const n = i + 1;
        const now = n === step, done = n <= maxStep;
        return (
          <button
            key={n}
            type="button"
            disabled={!done || now}
            aria-current={now ? 'step' : undefined}
            onClick={() => onGo(n)}
            className={[
              'flex-1 min-h-[52px] px-2 py-2 border-r border-line last:border-r-0',
              'flex items-center justify-center gap-2 text-[14px] transition',
              now ? 'bg-navy-50 text-navy-700 font-bold' : done ? 'text-navy-700 hover:bg-navy-50' : 'text-navy-400',
            ].join(' ')}
          >
            <span
              className={[
                'w-7 h-7 rounded-full inline-flex items-center justify-center font-bold text-[13px] shrink-0',
                now ? 'bg-brand-500 text-navy-900' : done ? 'bg-ok text-white' : 'bg-navy-100 text-navy-400',
              ].join(' ')}
            >
              {n}
            </span>
            <span className={now ? 'inline sm:hidden' : 'hidden'}>{SHORT[i]}</span>
            <span className="hidden sm:inline">{t}</span>
          </button>
        );
      })}
    </nav>
  );
}
