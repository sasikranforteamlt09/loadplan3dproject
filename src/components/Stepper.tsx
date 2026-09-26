import { IcCheck } from './Icons';

const LABELS = ['เลือกรถ', 'นับพัสดุในกองพัก', 'แผนการจัดวาง'];
const SHORT = ['เลือกรถ', 'นับพัสดุ', 'แผนจัดวาง'];

export default function Stepper({ step, maxStep, onGo }: { step: number; maxStep: number; onGo: (n: number) => void }) {
  return (
    <nav aria-label="ขั้นตอนการใช้งาน" className="mb-4 noprint">
      <ol className="flex items-center gap-1.5 sm:gap-2">
        {LABELS.map((t, i) => {
          const n = i + 1;
          const now = n === step;
          const done = n < step && n <= maxStep;
          const reachable = n <= maxStep;
          return (
            <li key={n} className="flex-1 min-w-0">
              <button
                type="button"
                disabled={!reachable || now}
                aria-current={now ? 'step' : undefined}
                onClick={() => onGo(n)}
                className={[
                  'w-full min-h-[56px] px-2 sm:px-3 rounded-card border-1.5 transition',
                  'flex items-center gap-2 sm:gap-2.5 text-left',
                  now
                    ? 'bg-white border-brand-500 shadow-pop'
                    : done
                      ? 'bg-white border-line hover:border-navy-300'
                      : 'bg-navy-50/70 border-transparent',
                ].join(' ')}
              >
                <span
                  aria-hidden="true"
                  className={[
                    'w-7 h-7 rounded-pill grid place-items-center text-[13px] font-black shrink-0',
                    now ? 'bg-brand-500 text-navy-900'
                      : done ? 'bg-ok text-white'
                        : 'bg-navy-200 text-navy-600',
                  ].join(' ')}
                >
                  {done ? <IcCheck size={15} /> : n}
                </span>
                <span className={[
                  'min-w-0 text-[12.5px] sm:text-[15px] leading-tight',
                  now ? 'font-bold text-ink' : done ? 'font-semibold text-navy-700' : 'font-semibold text-navy-400',
                ].join(' ')}>
                  <span className="sm:hidden">{SHORT[i]}</span>
                  <span className="hidden sm:inline">{t}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
