/* สร้างรหัสคิวอาร์ของที่อยู่เว็บที่เผยแพร่ ตอนสั่ง build (ไม่เรียกบริการภายนอก)
   อ่านค่า DEPLOY_URL จาก src/config.ts แล้วเขียนไฟล์ public/qr.svg */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cfg = readFileSync(resolve(root, 'src/config.ts'), 'utf8');
const m = cfg.match(/DEPLOY_URL\s*=\s*['"]([^'"]+)['"]/);
if (!m) { console.error('ไม่พบค่า DEPLOY_URL ใน src/config.ts'); process.exit(1); }

const svg = await QRCode.toString(m[1], {
  type: 'svg', errorCorrectionLevel: 'M', margin: 1, width: 320,
  color: { dark: '#1f3c58ff', light: '#ffffffff' },
});
writeFileSync(resolve(root, 'public/qr.svg'), svg);
console.log('สร้าง public/qr.svg จาก', m[1]);
