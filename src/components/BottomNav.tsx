import { IcTruck, IcBox, IcCube3D, IcCheck } from './Icons';

const ITEMS = [
  { n: 1, label: 'เลือกรถ', Ico: IcTruck },
  { n: 2, label: 'นับพัสดุ', Ico: IcBox },
  { n: 3, label: 'แผนจัดวาง', Ico: IcCube3D },
];

/** แถบนำทางล่างจอ ใช้แทนแถบขั้นตอนบนจอเมื่อดูด้วยมือถือ */
export default function BottomNav({ step, maxStep, onGo }: { step: number; maxStep: number; onGo: (n: number) => void }) {
  return (
    <nav
      aria-label="ขั้นตอนการใช้งาน"
      className="lp-nav fixed bottom-0 inset-x-0 z-30 bg-navy-900 border-t border-navy-800 noprint"
    >
      <ul className="flex max-w-[1180px] mx-auto">
        {ITEMS.map(({ n, label, Ico }) => {
          const now = n === step;
          const done = n < step && n <= maxStep;
          const reachable = n <= maxStep;
          return (
            <li key={n} className="flex-1">
              <button
                type="button"
                disabled={!reachable || now}
                aria-current={now ? 'step' : undefined}
                onClick={() => onGo(n)}
                className={[
                  'w-full min-h-[62px] px-1 pt-2 pb-1.5 flex flex-col items-center justify-center gap-0.5 transition',
                  now ? 'text-brand-400' : reachable ? 'text-navy-200' : 'text-navy-500',
                ].join(' ')}
              >
                <span className="relative">
                  <Ico size={23} />
                  {done && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-1 -right-2 w-4 h-4 rounded-pill bg-ok text-white grid place-items-center"
                    >
                      <IcCheck size={11} />
                    </span>
                  )}
                </span>
                <span className="text-[11.5px] font-bold leading-none">{n}. {label}</span>
                <span
                  aria-hidden="true"
                  className={`block h-[3px] w-7 rounded-pill mt-0.5 ${now ? 'bg-brand-400' : 'bg-transparent'}`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
