CARIA-GAP
ระบบแนะนำอาชีพและการวิเคราะห์ช่องว่างสมรรถนะ (Career Recommendation and Competency Gap Analysis System) ที่พัฒนาขึ้นตามแบบจำลอง CARIA Modified Euclidean Similarity model (66 มิติ, คะแนน 0-100)
โปรเจกต์นี้แบ่งออกเป็น 2 ส่วนหลัก:
Backend: FastAPI (Python) สำหรับประมวลผลอัลกอริทึม CARIA
Frontend: Next.js (React + TypeScript + Tailwind CSS v4 + Three.js) สำหรับการแสดงผลแบบ Interactive 3D และจำลองสถานการณ์

---

🛠️ สิ่งที่ต้องติดตั้งก่อนเริ่มต้น (Prerequisites)
ก่อนที่จะรันโปรเจกต์นี้ ตรวจสอบให้แน่ใจว่าเครื่องคอมพิวเตอร์ของคุณติดตั้งซอฟต์แวร์ต่อไปนี้เรียบร้อยแล้ว:
Python (เวอร์ชัน 3.10 ขึ้นไป)
ดาวน์โหลดได้ที่: python.org
หมายเหตุ: ตอนติดตั้งบน Windows อย่าลืมติ๊กเลือก "Add Python to PATH"
Node.js (เวอร์ชัน 18.0.0 หรือสูงกว่า)
แนะนำเวอร์ชัน LTS ล่าสุด (เช่น v20.x หรือ v22.x)
ดาวน์โหลดได้ที่: nodejs.org
pnpm (Package Manager)
โปรเจกต์นี้ใช้ `pnpm` ในการจัดการ library ฝั่ง Frontend
ติดตั้งได้ง่ายๆ ผ่าน cmd/PowerShell:

````bash
     npm install -g pnpm
     ```
---
🚀 ขั้นตอนการติดตั้งและรันโปรเจกต์ (Installation & Running)
เพื่อให้โปรเจกต์ทำงานได้อย่างสมบูรณ์ ต้องเริ่มรันทั้งฝั่ง Backend และ Frontend ควบคู่กันตามขั้นตอนต่อไปนี้:
1. วิธีติดตั้งและรัน Backend (FastAPI)
เปิด Terminal / Command Prompt แล้วเข้าไปที่โฟลเดอร์ `backend`:
```bash
   cd backend
````

สร้าง Virtual Environment เพื่อแยกโมดูลของ Python (แนะนำเพื่อป้องกันการชนกันของเวอร์ชัน):

```bash
   python -m venv venv
```

เปิดใช้งาน (Activate) Virtual Environment:
สำหรับ Windows (PowerShell):

````powershell
     .\venv\Scripts\Activate.ps1
     ```
(หากติดปัญหา Execution Policy ให้ใช้คำสั่ง `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process` ก่อนรันสคริปต์)
สำหรับ Windows (CMD):
```cmd
     .\venv\Scripts\activate.bat
     ```
สำหรับ macOS / Linux:
```bash
     source venv/bin/activate
     ```
ติดตั้ง Libraries ทั้งหมดที่จำเป็น:
```bash
   pip install -r requirements.txt
````

เริ่มต้นรันเซิร์ฟเวอร์ Backend:

```bash
   uvicorn main:app --reload
```

เซิร์ฟเวอร์จะเริ่มต้นทำงานที่: `http://127.0.0.1:8000`
คุณสามารถเข้าชม Interactive API Documentation (Swagger UI) ได้ที่: `http://127.0.0.1:8000/docs`

---

2. วิธีติดตั้งและรัน Frontend (Next.js)
   เปิด Terminal ใหม่ (ไม่ต้องปิดอันเดิมที่รัน Backend) แล้วเข้าไปที่โฟลเดอร์ `frontend`:

```bash
   cd frontend
```

ติดตั้ง Node.js Dependencies ด้วย `pnpm`:

```bash
   pnpm install
```

เริ่มต้นรันเว็บแอปพลิเคชันในโหมดพัฒนา (Development):

```bash
   pnpm dev
```

## หน้าเว็บจะทำงานที่: `http://localhost:3000`

⚙️ การตั้งค่าสภาพแวดล้อม (Environment Variables) - ทางเลือกเพิ่มเติม
โดยปกติระบบจะตั้งค่าเชื่อมต่อระหว่าง Frontend และ Backend แบบอัตโนมัติที่ `http://127.0.0.1:8000`
หากคุณต้องการเปลี่ยนที่อยู่ของ API (เช่น ย้าย Backend ไปรันเครื่องอื่น หรือขึ้น Cloud) ให้ทำตามขั้นตอนดังนี้:
สร้างไฟล์ชื่อ `.env.local` ในโฟลเดอร์ `frontend/`
ใส่การเชื่อมโยง API ปลายทาง:

```env
   NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
```

---

💡 ระบบจำลองออฟไลน์ (Offline Fallback Mode)
โปรเจกต์นี้ได้รับการออกแบบมาให้ทำงานได้แม้ไม่เปิดใช้งาน Backend (เช่น สำหรับการสาธิตอย่างรวดเร็ว)
หากเชื่อมต่อกับ Backend ไม่ได้ ระบบจะเปลี่ยนไปใช้ Mock Data สำหรับผลการแนะนำอาชีพและการวิเคราะห์ช่องว่างความสามารถโดยอัตโนมัติ ทำให้ผู้ใช้ยังสามารถเล่นหน้าเว็บและเห็นการทำงานของ 3D Interactive ได้อย่างไม่มีสะดุด

---

📜 คำสั่งที่ใช้บ่อย (Frontend Scripts)
รันคำสั่งเหล่านี้ภายในโฟลเดอร์ `frontend/` ด้วย `pnpm`:

| คำสั่ง | การทำงาน |
| --- | --- |
| `pnpm install` | ติดตั้ง dependencies ทั้งหมด (อ่านจาก `pnpm-lock.yaml`) |
| `pnpm dev` | รันเซิร์ฟเวอร์โหมดพัฒนาที่ `http://localhost:3000` |
| `pnpm build` | สร้าง production build (ตรวจ type + lint ครบทุก route) |
| `pnpm start` | รัน production build ที่ build ไว้แล้ว |
| `pnpm lint` | ตรวจสอบโค้ดด้วย ESLint |

> ⚠️ Frontend ใช้ **pnpm เท่านั้น** — อย่ารัน `npm install` ในโฟลเดอร์นี้ เพราะ npm จะ prune แพ็กเกจที่ pnpm จัดการอยู่ออก และทำให้ build พัง

---

📚 เทคโนโลยีและแพ็กเกจหลัก (Frontend Tech Stack)

- **Framework & ภาษา:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS v4
- **ฟอนต์ (Typography):** `geist` (Geist Sans/Mono สำหรับเนื้อหาและโค้ด), Syne (ฟอนต์ Display สำหรับหัวข้อ โหลดผ่าน `next/font/google`), IBM Plex Sans Thai (ภาษาไทย)
- **3D & การแสดงผลข้อมูล:** `three`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`, `recharts`
- **แอนิเมชัน:** `framer-motion` / `motion`
- **UI Components (สไตล์ shadcn):** `@radix-ui/*` (dialog, dropdown-menu, select, tabs, tooltip ฯลฯ), `cmdk`, `vaul`, `sonner`, `input-otp`, `embla-carousel-react`, `react-day-picker`, `react-hook-form`
- **Utilities & สไตล์:** `class-variance-authority`, `tailwind-merge`, `clsx`, `lucide-react` (ไอคอน), `tw-animate-css`, `next-themes` (สลับธีม Dark/Light)
- **Analytics:** `@vercel/analytics`

### 🆕 แพ็กเกจที่เพิ่ม/ประกาศเพิ่มในรอบอัปเดตนี้

ประกาศแพ็กเกจต่อไปนี้ลงใน `package.json` เพื่อเสริมระบบฟอนต์/UI ให้สมบูรณ์ และให้ติดตั้งซ้ำบนเครื่องใหม่ได้ (reproducible):

- `geist` — เปิดใช้งานฟอนต์ Geist ทั้งระบบ (เดิมโค้ดอ้างถึง `font-syne` / `font-sans` แต่ฟอนต์ไม่เคยถูกโหลดจริง จึง fallback เป็น system sans)
- `tw-animate-css` — ยูทิลิตี้แอนิเมชันที่ `globals.css` เรียกใช้ (`@import 'tw-animate-css'`)
- ชุด `@radix-ui/*`, `motion`, `@vercel/analytics`, `cmdk`, `vaul`, `sonner`, `input-otp`, `react-hook-form`, `react-day-picker`, `embla-carousel-react`, `class-variance-authority` — เดิมถูกเรียกใช้ในโค้ดแต่ไม่ได้ประกาศไว้ใน `package.json` (ติดตั้งค้างอยู่ใน `node_modules` เฉยๆ) จึงประกาศให้ครบ เพื่อให้ `pnpm install` บนเครื่องใหม่ทำงานได้ทันทีโดยไม่พัง

> Syne ถูกตั้งค่าผ่าน `next/font/google` ใน `app/layout.tsx` และเชื่อมเข้ากับ Tailwind ผ่าน token `--font-syne` ใน `globals.css` ทำให้คลาส `font-syne` / `font-sans` / `font-mono` ทั่วทั้งโปรเจกต์แสดงผลด้วยฟอนต์ที่ตั้งใจไว้

---

📦 โครงสร้างโปรเจกต์ที่สำคัญ (Key Folder Structure)

```text
caria-gap/
├── backend/                  # ส่วนประมวลผล API และระบบคำนวณ CARIA
│   ├── main.py               # จุดเริ่มต้นของ FastAPI
│   ├── requirements.txt      # รายการ Library ของ Python
│   ├── routers/              # เส้นทาง API (Assessment, Gap Analysis, Recommendations)
│   └── models/               # การจัดการข้อมูลและคำนวณทางคณิตศาสตร์
│
├── frontend/                 # หน้าตาเว็บไซต์แบบ Interactive
│   ├── src/
│   │   ├── components/       # UI Components (3D Sphere, Simulator, Charts)
│   │   └── lib/              # ฟังก์ชันติดต่อ API และ Mock Data
│   ├── package.json          # ไฟล์กำหนดสคริปต์และ Module ฝั่ง Frontend
│   └── pnpm-lock.yaml        # บันทึกเวอร์ชันที่ถูกต้องของ Frontend
│
└── README.md                 # คู่มือการใช้งานนี้
```
