import { Link } from 'react-router-dom';
import { THESIS } from '../config';

export function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold text-lg ${light ? 'text-white' : 'text-navy-900'}`}>
      <span
        aria-hidden="true"
        className="w-7 h-7 rounded-md bg-gradient-to-br from-brand-500 to-brand-300 text-navy-900
                   inline-flex items-center justify-center text-sm font-black"
      >
        L3
      </span>
      LoadPlan 3D
    </span>
  );
}

export function AppHeader() {
  return (
    <header className="bg-navy-900 text-white pt-[env(safe-area-inset-top,0px)] noprint">
      <div className="max-w-[1180px] mx-auto px-4 h-[60px] flex items-center justify-between">
        <Link to="/" className="no-underline"><BrandMark light /></Link>
        <Link
          to="/"
          className="text-navy-200 text-sm no-underline hover:text-white inline-flex items-center min-h-[44px] px-2"
        >
          ← หน้าแรก
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-950 text-navy-300 text-sm py-7 pb-[calc(1.75rem+env(safe-area-inset-bottom,0px))] noprint">
      <div className="max-w-[1160px] mx-auto px-5 flex flex-wrap justify-between gap-5">
        <div className="max-w-[560px]">
          <b className="text-navy-100 font-semibold">{THESIS.title}</b>
          <br />
          {THESIS.subtitle}
        </div>
        <div>
          {THESIS.program} {THESIS.faculty}
          <br />
          {THESIS.university} · {THESIS.year}
        </div>
      </div>
    </footer>
  );
}
