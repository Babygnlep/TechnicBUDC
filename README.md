# Work Calendar App

A modern work calendar application built with React, Vite, Tailwind CSS, FullCalendar, Framer Motion, Node.js, Express, SQLite, and Google Calendar integration support.

## Tech stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- UI: FullCalendar + Framer Motion + Recharts
- Backend: Node.js + Express
- Database: SQLite via better-sqlite3
- Integrations: Google Calendar API and OAuth2 support (wired for extension)

## Project structure

- client/
- server/
- database/

## Getting started

### 1. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

### 2. Start the backend

```bash
cd server
npm run dev
```

### 3. Start the frontend

```bash
cd client
npm run dev
```

### 4. Open the app

Visit http://localhost:5173

## Features implemented

- Monthly / weekly / daily calendar views
- Create, edit, delete, drag, and resize events
- Search and filter events by project
- Dashboard statistics and bar chart
- CSV, Excel, and PDF export
- Responsive layout and dark mode

## Notes

Google OAuth and Calendar sync are scaffolded in the backend structure and can be completed by adding your Google credentials to environment variables if you want full live sync.

## Google Calendar setup (สั้น ๆ)

1. สร้าง Service Account ใน Google Cloud Console และเปิดใช้งาน Google Calendar API สำหรับโปรเจ็กต์
2. ดาวน์โหลดไฟล์คีย์ (JSON) ของ Service Account แล้วคัดลอกค่า `client_email` และ `private_key`
3. แชร์ปฏิทินเป้าหมายให้กับ `client_email` ของ Service Account (ผ่านการตั้งค่าปฏิทิน → แชร์)
4. สร้างไฟล์ `.env.local` ในโฟลเดอร์โปรเจ็กต์ (สำหรับการพัฒนา) หรือตั้งค่าตัวแปรในโฮสต์ (Vercel เป็นต้น)

ตัวอย่างตัวแปรที่ต้องตั้ง (ดูไฟล์ `.env.local.example` ที่โปรเจ็กต์):

```
GOOGLE_CALENDAR_ID=your-calendar-id@group.calendar.google.com
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-sa@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n"
GOOGLE_CALENDAR_TIMEZONE=Asia/Bangkok
```

หมายเหตุ: ใส่ `\n` แทนการขึ้นบรรทัดใหม่ใน `GOOGLE_PRIVATE_KEY` หรือห่อคีย์ทั้งก้อนด้วยเครื่องหมายคำพูดสองชั้นเพื่อให้โค้ดในโปรเจ็กต์สามารถแปลงกลับเป็นบรรทัดจริงได้

หลังตั้งค่าเสร็จ ให้รันโปรเจ็กต์แบบปกติ (`npm run dev`) และทดสอบการเพิ่มงานจาก UI — ข้อผิดพลาดเกี่ยวกับการส่งไป Google Calendar จะบอกว่าขาดคีย์ตัวไหนถ้าไม่ได้ตั้งค่าอย่างครบถ้วน.

## การเก็บข้อมูลวันที่ลงงานถาวร

ระบบใช้ PostgreSQL เป็นที่เก็บข้อมูลเพียงแห่งเดียว ไม่มีการบันทึก fallback ลงไฟล์หรือพื้นที่ชั่วคราว ดังนั้นข้อมูลจึงคงอยู่หลัง redeploy หรือการเริ่ม server ใหม่.

1. สร้างฐานข้อมูล PostgreSQL (เช่น Neon, Vercel Postgres หรือ Supabase)
2. เพิ่ม connection string เป็น `POSTGRES_URL` ใน Vercel: **Project Settings → Environment Variables** และเลือก Production (รวมถึง Preview หากต้องการทดสอบ)
3. Deploy ใหม่หนึ่งครั้ง

ระบบจะสร้างตาราง `schedule_entries` และ `schedule_signers` อัตโนมัติเมื่อเชื่อมต่อครั้งแรก. หากยังไม่ได้ตั้ง connection string ระบบจะไม่รับการบันทึก เพื่อป้องกันการแสดงผลเหมือนบันทึกสำเร็จทั้งที่ข้อมูลหายภายหลัง.

## รหัสผ่านระบบลงงาน

หน้าลงงานและ API ต้องเข้าสู่ระบบก่อนใช้งาน โดยตั้งค่า password ใน Vercel Environment Variables แล้ว deploy ใหม่. รหัสผ่านจะไม่ถูกส่งไปยัง browser หรือเก็บไว้ใน source code.

- `SCHEDULE_USER_PASSWORD`: ดูตารางและเพิ่มวันพร้อมทำงาน
- `SCHEDULE_ADMIN_PASSWORD`: สิทธิ์ทั้งหมด รวมถึงลบงานและลบรายชื่อ

ค่าเดิม `SCHEDULE_ACCESS_PASSWORD` ยังใช้เป็นรหัสผ่านระดับ user ได้ เพื่อให้การตั้งค่าเดิมไม่หยุดทำงาน.
