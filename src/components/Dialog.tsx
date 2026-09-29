import { useEffect, useRef, useState } from 'react';
import { IcAlert, IcCheckCircle } from './Icons';

/* กล่องแจ้งเตือนของระบบเอง ใช้แทน window.alert / window.confirm
   เพื่อไม่ให้เบราว์เซอร์แสดงชื่อเว็บไซต์ และให้หน้าตาเข้ากับระบบ */

interface DialogReq {
  kind: 'alert' | 'confirm';
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  danger: boolean;
  resolve: (v: boolean) => void;
}

let push: ((r: DialogReq) => void) | null = null;

export function notify(title: string, message: string, okLabel = 'ตกลง'): Promise<void> {
  return new Promise(res => {
    const r: DialogReq = { kind: 'alert', title, message, okLabel, cancelLabel: '', danger: false, resolve: () => res() };
    if (push) push(r); else res();
  });
}

export function ask(title: string, message: string, opts: { okLabel?: string; cancelLabel?: string; danger?: boolean } = {}): Promise<boolean> {
  return new Promise(res => {
    const r: DialogReq = {
      kind: 'confirm', title, message,
      okLabel: opts.okLabel ?? 'ทำต่อ', cancelLabel: opts.cancelLabel ?? 'ยกเลิก',
      danger: !!opts.danger, resolve: res,
    };
    if (push) push(r); else res(false);
  });
}

export default function DialogHost() {
  const [queue, setQueue] = useState<DialogReq[]>([]);
  const okRef = useRef<HTMLButtonElement>(null);
  const cur = queue[0];

  useEffect(() => {
    push = r => setQueue(q => [...q, r]);
    return () => { push = null; };
  }, []);

  const close = (v: boolean) => {
    if (!cur) return;
    cur.resolve(v);
    setQueue(q => q.slice(1));
  };

  useEffect(() => {
    if (!cur) return;
    const prev = document.activeElement as HTMLElement | null;
    okRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close(false); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur]);

  if (!cur) return null;
  const warn = cur.kind === 'alert' || cur.danger;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-navy-950/60 backdrop-blur-[2px] noprint"
      onMouseDown={e => { if (e.target === e.currentTarget && cur.kind === 'alert') close(false); }}>
      <div role="alertdialog" aria-modal="true" aria-labelledby="dlg-t" aria-describedby="dlg-m"
        className="w-full max-w-[420px] bg-white rounded-card shadow-[0_20px_50px_rgba(15,34,54,.35)] overflow-hidden
                   pb-[env(safe-area-inset-bottom,0px)]">
        <div className="p-5 pb-4 flex gap-3.5 items-start">
          <span className={`w-11 h-11 rounded-full grid place-items-center shrink-0 ${warn ? 'bg-warn-bg text-warn' : 'bg-navy-100 text-navy-700'}`}>
            {warn ? <IcAlert size={24} /> : <IcCheckCircle size={24} />}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="dlg-t" className="m-0 text-[18px] font-bold text-ink leading-snug">{cur.title}</h2>
            <p id="dlg-m" className="m-0 mt-1.5 text-[15px] text-muted leading-relaxed whitespace-pre-line">{cur.message}</p>
          </div>
        </div>
        <div className={`px-5 pb-5 flex gap-2.5 ${cur.kind === 'confirm' ? 'flex-col-reverse sm:flex-row sm:justify-end' : ''}`}>
          {cur.kind === 'confirm' && (
            <button type="button" className="lp-btn-outline sm:min-w-[110px]" onClick={() => close(false)}>{cur.cancelLabel}</button>
          )}
          <button ref={okRef} type="button"
            className={`lp-btn sm:min-w-[110px] ${cur.kind === 'alert' ? 'w-full' : ''} ${cur.danger ? 'bg-danger text-white hover:opacity-90' : 'bg-brand-500 text-navy-900 hover:bg-brand-400'}`}
            onClick={() => close(true)}>{cur.okLabel}</button>
        </div>
      </div>
    </div>
  );
}
