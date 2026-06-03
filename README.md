# CARIA-GAP 🚀

ยินดีต้อนรับสู่โปรเจกต์ **CARIA-GAP**! โปรเจกต์นี้ประกอบด้วยสองส่วนหลักคือ **Frontend** (สร้างด้วย Next.js) และ **Backend** (สร้างด้วย FastAPI) 

ไฟล์ README นี้ถูกเขียนขึ้นเพื่อให้ทุกคนในทีมสามารถติดตั้งและรันโปรเจกต์นี้ในเครื่องตัวเองได้อย่างง่ายดายแบบไม่มี Error รบกวน! 😄

---

## 📋 สิ่งที่ต้องติดตั้งก่อนเริ่ม (Prerequisites)

ก่อนจะเริ่มรันโปรเจกต์ ให้ตรวจสอบว่าในเครื่องมีโปรแกรมเหล่านี้ติดตั้งไว้แล้ว:
1. **Node.js** (แนะนำเวอร์ชัน 18.x ขึ้นไป) - [ดาวน์โหลด Node.js](https://nodejs.org/)
2. **pnpm** (เครื่องมือจัดการ Package ของ Node.js) - ติดตั้งโดยรันคำสั่ง `npm install -g pnpm`
3. **Python** (แนะนำเวอร์ชัน 3.10 ขึ้นไป) - [ดาวน์โหลด Python](https://www.python.org/downloads/)
4. **Git** - [ดาวน์โหลด Git](https://git-scm.com/downloads)

---

## 🚀 วิธีการติดตั้งและรันโปรเจกต์

### ขั้นตอนที่ 1: Clone โปรเจกต์ลงมาที่เครื่อง
เปิด Terminal (หรือ Command Prompt / PowerShell) แล้วรันคำสั่ง:
```bash
git clone https://github.com/kraveerachat/caria-gap-main.git
cd caria-gap-main
```

---

### ขั้นตอนที่ 2: ตั้งค่าและรัน Backend (FastAPI) 🐍

Backend ถูกเขียนด้วย Python (FastAPI) ทำตามขั้นตอนนี้เพื่อรัน:

1. เข้าไปที่โฟลเดอร์ `backend`:
   ```bash
   cd backend
   ```
2. สร้าง Virtual Environment (เพื่อไม่ให้ Library ไปตีกับโปรเจกต์อื่นในเครื่อง):
   ```bash
   python -m venv venv
   ```
3. เปิดใช้งาน (Activate) Virtual Environment:
   - **บน Windows**:
     ```bash
     venv\Scripts\activate
     ```
   - **บน Mac / Linux**:
     ```bash
     source venv/bin/activate
     ```
4. ติดตั้ง Libraries ที่จำเป็น:
   ```bash
   pip install -r requirements.txt
   ```
5. สั่งรัน Backend Server:
   ```bash
   uvicorn main:app --reload
   ```
   🎉 Backend จะรันอยู่ที่: [http://localhost:8000](http://localhost:8000)

---

### ขั้นตอนที่ 3: ตั้งค่าและรัน Frontend (Next.js) 💻

Frontend ถูกเขียนด้วย Next.js เราจะใช้ `pnpm` ในการจัดการ packages:

1. เปิด Terminal **แท็บใหม่** (อย่าปิดแท็บ Backend)
2. กลับไปที่โฟลเดอร์หลักของโปรเจกต์ แล้วเข้าไปที่ `frontend`:
   ```bash
   cd caria-gap-main/frontend
   ```
3. ติดตั้ง Packages ทั้งหมดด้วย pnpm:
   ```bash
   pnpm install
   ```
4. สั่งรัน Frontend Server:
   ```bash
   pnpm run dev
   ```
   🎉 Frontend จะรันอยู่ที่: [http://localhost:3000](http://localhost:3000) (หรือ 3001 ถ้าพอร์ตซ้ำ)

---

## 🛠 คำแนะนำเพิ่มเติมเมื่อเจอปัญหา (Troubleshooting)

- **รัน Frontend ไม่ได้ฟ้องเรื่อง pnpm**: แปลว่ายังไม่ได้ติดตั้ง pnpm ให้รัน `npm install -g pnpm` ก่อน
- **รัน Backend ฟ้องว่าหา uvicorn/fastapi ไม่เจอ**: ตรวจสอบว่าได้ทำการ Activate Virtual Environment (ขั้นตอน 2.3) ก่อนสั่ง `pip install` และ `uvicorn` หรือยัง
- **ต้องการดึงโค้ดอัพเดทล่าสุดจากเพื่อน**: ให้เข้าไปในโฟลเดอร์หลัก `caria-gap-main` แล้วรัน `git pull origin main`

ขอให้สนุกกับการพัฒนาโปรเจกต์ CARIA-GAP ครับ! ✌️
