import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeroScene from '../components/HeroScene';
import { BrandMark, Footer } from '../components/Layout';
import { DEPLOY_URL, THESIS } from '../config';

const SHOTS = [
  { src: '/screenshots/step1.png', t: 'ขั้นที่ 1 เลือกรถและขนาดตู้', d: 'เลือกรถที่ใช้จริง หรือกำหนดขนาดภายในตู้เอง พร้อมภาพตัวอย่างตู้สามมิติ' },
  { src: '/screenshots/step2.png', t: 'ขั้นที่ 2 นับพัสดุในกองพัก', d: 'กด + / − นับจำนวนพัสดุแต่ละกลุ่มขนาด ปุ่มใหญ่พอสำหรับใช้งานที่หน้างาน' },
  { src: '/screenshots/step3.png', t: 'ขั้นที่ 3 แผนการจัดวาง', d: 'ภาพสามมิติ อัตราการใช้ประโยชน์ปริมาตร และลำดับการวางที่พิมพ์ไปใช้ได้' },
];

const RULES = [
  'วางขนานกับผนังตู้ และอยู่ภายในขอบเขตตู้',
  'กล่องไม่ซ้อนทับกัน และไม่เกินน้ำหนักบรรทุก',
  'ฐานของกล่องต้องมีสิ่งรองรับเต็มพื้นที่',
  'ของหนักอยู่ล่าง ไม่วางของหนักทับของเบา',
  'ของหนักอยู่ด้านท้ายของกอง',
];

export default function Landing() {
  useEffect(() => { document.title = 'LoadPlan 3D · ระบบช่วยวางแผนการจัดวางพัสดุขึ้นรถบรรทุก'; }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* แถบบน */}
      <header className="absolute inset-x-0 top-0 z-10 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-[1160px] mx-auto px-5 h-[68px] flex items-center justify-between">
          <BrandMark light />
          <nav className="flex items-center gap-1 sm:gap-4">
            <a href="#problem" className="hidden md:inline-flex items-center min-h-[44px] px-2 text-navy-200 text-[15px] no-underline hover:text-white">ที่มา</a>
            <a href="#how" className="hidden md:inline-flex items-center min-h-[44px] px-2 text-navy-200 text-[15px] no-underline hover:text-white">วิธีใช้</a>
            <a href="#method" className="hidden md:inline-flex items-center min-h-[44px] px-2 text-navy-200 text-[15px] no-underline hover:text-white">หลักการ</a>
            <Link to="/app" className="inline-flex items-center min-h-[44px] px-4 rounded-full bg-white/10 border border-white/25 text-white text-[15px] no-underline hover:bg-white/20">
              เริ่มใช้งาน
            </Link>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="text-white bg-navy-900 bg-[radial-gradient(1200px_600px_at_75%_35%,#1f4a70_0%,#0f2236_60%)] overflow-hidden">
        <div className="max-w-[1160px] mx-auto px-5 pt-24 pb-12 grid lg:grid-cols-[1.05fr_1fr] gap-6 items-center lg:min-h-[640px]">
          <div>
            <span className="inline-block text-[13.5px] text-brand-300 border border-brand-300/40 bg-brand-500/10 px-3 py-1 rounded-full mb-4">
              ผลงานจากปริญญานิพนธ์ · สาขาเทคโนโลยีโลจิสติกส์
            </span>
            <h1 className="text-[30px] sm:text-[40px] lg:text-[50px] font-bold leading-tight mb-4">
              จัดพัสดุขึ้นรถ<br />ให้
              <em className="not-italic bg-gradient-to-r from-brand-500 to-brand-300 bg-clip-text text-transparent">เป็นระบบ</em>{' '}
              <span className="whitespace-nowrap">ด้วยแผนสามมิติ</span>
            </h1>
            <p className="text-[17px] sm:text-[18px] text-navy-200 max-w-[540px] mb-7">
              บอกขนาดตู้กับจำนวนพัสดุในกองพัก ระบบคำนวณตำแหน่งวางทุกชิ้นด้วยขั้นตอนวิธีจุดสุดขอบ
              แล้วแสดงเป็นภาพสามมิติกับลำดับการวางที่พิมพ์ไปใช้หน้างานได้
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/app" className="lp-btn-primary no-underline text-[17px] px-7 min-h-[52px]">
                เริ่มวางแผนการจัดวาง →
              </Link>
              <a href="#problem" className="lp-btn border border-white/30 text-white no-underline px-6 min-h-[52px] hover:bg-white/10">
                ที่มาของงานวิจัย
              </a>
            </div>
          </div>
          <HeroScene />
        </div>
      </section>

      {/* ที่มาของปัญหา */}
      <section id="problem" className="py-16 sm:py-20">
        <div className="max-w-[1160px] mx-auto px-5">
          <p className="text-brand-600 font-semibold text-sm tracking-wide mb-1.5">ที่มาของปัญหา</p>
          <h2 className="text-[24px] sm:text-[32px] font-bold mb-3">การจัดวางพัสดุวันนี้ อาศัยประสบการณ์ของคนเป็นหลัก</h2>
          <p className="text-muted max-w-[680px] mb-9 text-[17px]">
            ที่ศูนย์กระจายพัสดุ พัสดุทยอยมาจากสายพานแล้วกองพักไว้ก่อนยกขึ้นรถ
            ผู้ปฏิบัติงานต้องตัดสินใจเองว่าจะวางชิ้นไหนก่อน ตรงไหน
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <Card t="ขนาดกล่องหลากหลาย" d="พัสดุมาจากผู้ส่งทั่วประเทศ ขนาดไม่เท่ากัน การหาตำแหน่งที่ลงตัวจึงยาก"
              icon={<><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 7v10l9 4 9-4V7" /></>} />
            <Card t="ขึ้นกับความชำนาญ" d="คนที่มีประสบการณ์จัดได้เร็วกว่ามาก ส่วนผู้ปฏิบัติงานใหม่ต้องใช้เวลาเรียนรู้"
              icon={<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>} />
            <Card t="ของหนักต้องอยู่ล่าง" d="ต้องคิดเรื่องน้ำหนัก ฐานรองรับ และพื้นที่ไปพร้อมกัน ภายใต้เวลาที่จำกัด"
              icon={<><path d="M4 20h16" /><path d="M6 16V9m6 7V5m6 11v-4" /></>} />
          </div>
        </div>
      </section>

      {/* วิธีใช้ */}
      <section id="how" className="py-16 sm:py-20 bg-white border-y border-line">
        <div className="max-w-[1160px] mx-auto px-5">
          <p className="text-brand-600 font-semibold text-sm tracking-wide mb-1.5">วิธีใช้งาน</p>
          <h2 className="text-[24px] sm:text-[32px] font-bold mb-3">3 ขั้นตอน ได้แผนการจัดวาง</h2>
          <p className="text-muted max-w-[680px] mb-9 text-[17px]">
            ออกแบบให้ใช้ที่หน้างานได้จริง นับพัสดุด้วยปุ่ม + / − บนมือถือ แล้วพิมพ์แผนออกมาใช้
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              ['เลือกรถ', 'เลือกรถ 4 ล้อตู้ทึบ หรือกำหนดขนาดภายในตู้เอง ดูตัวอย่างตู้เป็นภาพสามมิติได้ทันที'],
              ['นับพัสดุในกองพัก', 'นับจำนวนพัสดุแต่ละกลุ่มขนาดที่อยู่ในกอง ณ เวลาเริ่มจัดวาง ขนาดของแต่ละกลุ่มวัดไว้ล่วงหน้าแล้ว'],
              ['รับแผนการจัดวาง', 'ดูภาพสามมิติ ภาพรายผนัง และลำดับการวางทีละชิ้น พร้อมพิมพ์ไปใช้หน้างาน'],
            ].map(([t, d], i) => (
              <div key={t} className="lp-card p-6">
                <span className="w-9 h-9 rounded-full bg-navy-800 text-white font-bold inline-flex items-center justify-center">{i + 1}</span>
                <h3 className="text-[19px] font-bold mt-3 mb-1.5">{t}</h3>
                <p className="text-muted text-[15.5px] m-0">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ภาพหน้าจอจริง */}
      <section id="screens" className="py-16 sm:py-20">
        <div className="max-w-[1160px] mx-auto px-5">
          <p className="text-brand-600 font-semibold text-sm tracking-wide mb-1.5">หน้าตาของระบบ</p>
          <h2 className="text-[24px] sm:text-[32px] font-bold mb-3">ภาพหน้าจอของระบบ (ข้อมูลตัวอย่าง)</h2>
          <p className="text-muted max-w-[680px] mb-9 text-[17px]">ทุกภาพถ่ายจากระบบรุ่นที่เผยแพร่ ไม่ใช่ภาพจำลอง</p>
          <div className="grid md:grid-cols-3 gap-5">
            {SHOTS.map(s => (
              <figure key={s.src} className="lp-card overflow-hidden m-0">
                <img src={s.src} alt={s.t} loading="lazy" width={1170} height={2532}
                  className="w-full block border-b border-line bg-navy-50" />
                <figcaption className="p-4">
                  <b className="block text-[16px] mb-1">{s.t}</b>
                  <span className="text-muted text-[14.5px]">{s.d}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* หลักการ */}
      <section id="method" className="py-16 sm:py-20 bg-white border-y border-line">
        <div className="max-w-[1160px] mx-auto px-5 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-brand-600 font-semibold text-sm tracking-wide mb-1.5">หลักการคำนวณ</p>
            <h2 className="text-[24px] sm:text-[32px] font-bold mb-3">ขั้นตอนวิธีจุดสุดขอบ<br />(Extreme Point)</h2>
            <p className="text-muted mb-6 text-[17px]">
              แนวคิดของ Crainic, Perboli และ Tadei (2008) ทุกครั้งที่วางกล่อง ระบบจะสร้างจุดที่วางกล่องชิ้นถัดไปได้ขึ้นมาใหม่
              แล้วลองวางเฉพาะที่จุดเหล่านั้น จึงคำนวณได้เร็วโดยไม่ต้องลองทุกตำแหน่งในตู้
            </p>
            <ul className="list-none p-0 m-0 grid gap-2.5">
              {RULES.map((t, i) => (
                <li key={t} className="flex gap-3 items-start bg-surface border border-line rounded-xl px-4 py-3 text-[15.5px]">
                  <span className="shrink-0 w-6.5 h-6.5 min-w-[26px] h-[26px] rounded-full bg-navy-800 text-white font-semibold text-[13px] flex items-center justify-center">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-navy-900 rounded-2xl p-5 text-navy-200">
            <svg viewBox="0 0 360 260" role="img" aria-label="ภาพอธิบายจุดสุดขอบ" className="w-full h-auto block">
              <defs>
                <linearGradient id="gA" x1="0" x2="1"><stop offset="0" stopColor="#2f6ea3" /><stop offset="1" stopColor="#3f86c2" /></linearGradient>
                <linearGradient id="gB" x1="0" x2="1"><stop offset="0" stopColor="#f59e0b" /><stop offset="1" stopColor="#fac278" /></linearGradient>
              </defs>
              <line x1="40" y1="220" x2="340" y2="220" stroke="#5d7892" strokeWidth="2" />
              <line x1="40" y1="220" x2="40" y2="20" stroke="#5d7892" strokeWidth="2" />
              <text x="300" y="240" fill="#8fa6bc" fontSize="12">ความลึก</text>
              <text x="14" y="16" fill="#8fa6bc" fontSize="12">สูง</text>
              <rect x="40" y="130" width="120" height="90" fill="url(#gA)" rx="3" />
              <text x="100" y="180" fill="#fff" fontSize="13" textAnchor="middle">กล่องที่วางแล้ว</text>
              <rect x="40" y="70" width="70" height="60" fill="url(#gA)" opacity=".75" rx="3" />
              <rect x="160" y="170" width="70" height="50" fill="url(#gB)" rx="3" stroke="#fff" strokeDasharray="4 3" />
              <text x="195" y="199" fill="#0f2236" fontSize="12" textAnchor="middle">ชิ้นถัดไป</text>
              <g fill="#fac278" stroke="#0f2236" strokeWidth="2">
                <circle cx="160" cy="220" r="7" /><circle cx="110" cy="130" r="7" /><circle cx="40" cy="70" r="7" />
                <circle cx="110" cy="70" r="7" /><circle cx="160" cy="130" r="7" />
              </g>
            </svg>
            <p className="text-[14.5px] mt-3">
              ● จุดสีส้มคือ <b className="text-white">จุดสุดขอบ</b> ตำแหน่งที่วางกล่องชิ้นถัดไปได้
              ระบบเลือกจุดที่ลึกที่สุดและต่ำที่สุดที่วางได้โดยไม่ผิดเงื่อนไข
            </p>
          </div>
        </div>
      </section>

      {/* ความเป็นส่วนตัว + คิวอาร์ */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1160px] mx-auto px-5 grid lg:grid-cols-2 gap-5">
          <div className="flex gap-4 items-center bg-gradient-to-br from-[#eef7f1] to-[#f6fbf8] border border-[#cfe6d7] rounded-2xl p-6">
            <span className="shrink-0 w-12 h-12 rounded-xl bg-[#dff0e5] text-ok flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <div>
              <b>ข้อมูลไม่ออกจากเครื่องของคุณ</b><br />
              <span className="text-muted text-[15px]">
                การคำนวณทั้งหมดทำในเบราว์เซอร์ ไม่มีการส่งข้อมูลพัสดุไปยังเครื่องแม่ข่ายภายนอก
                ไม่มีระบบฐานข้อมูล และไม่มีการเก็บข้อมูลไว้ในเครื่อง
              </span>
            </div>
          </div>
          <div className="lp-card p-6 flex flex-col sm:flex-row gap-5 items-center">
            <img src="/qr.svg" alt={`รหัสคิวอาร์สำหรับเปิดเว็บ ${DEPLOY_URL}`} width={150} height={150}
              className="w-[150px] h-[150px] shrink-0 border border-line rounded-lg bg-white p-1.5" />
            <div>
              <b className="block text-[17px] mb-1">สแกนเพื่อเปิดบนมือถือ</b>
              <p className="text-muted text-[15px] m-0 mb-2">
                ใช้กล้องมือถือสแกนรหัสคิวอาร์นี้ เปิดใช้งานได้ทันที ไม่ต้องติดตั้งโปรแกรม
              </p>
              <code className="text-[13px] text-navy-700 break-all">{DEPLOY_URL}</code>
            </div>
          </div>
        </div>
      </section>

      {/* ปิดท้าย */}
      <section className="bg-navy-900 text-white text-center py-16">
        <div className="max-w-[1160px] mx-auto px-5">
          <h2 className="text-[24px] sm:text-[32px] font-bold mb-2.5">พร้อมลองวางแผนแล้วหรือยัง</h2>
          <p className="text-navy-200 mb-6">ใช้ได้ทั้งบนคอมพิวเตอร์และมือถือ ไม่ต้องติดตั้งโปรแกรม</p>
          <Link to="/app" className="lp-btn-primary no-underline text-[17px] px-7 min-h-[52px]">เริ่มวางแผนการจัดวาง →</Link>
        </div>
      </section>

      <Footer />
      <p className="sr-only">{THESIS.university}</p>
    </div>
  );
}

function Card({ t, d, icon }: { t: string; d: string; icon: React.ReactNode }) {
  return (
    <div className="lp-card p-6">
      <span className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">{icon}</svg>
      </span>
      <h3 className="text-[19px] font-bold mt-3 mb-1.5">{t}</h3>
      <p className="text-muted text-[15.5px] m-0">{d}</p>
    </div>
  );
}
