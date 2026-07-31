# 🚀 Activity Logs Migration - Quick Start

## วิธี Migrate (เลือก 1 วิธี)

### ✅ วิธีที่ 1: ใช้ npm script (ง่ายที่สุด)

```bash
npm run db:migrate-logs
```

จากนั้นทำตามคำถามที่ขึ้นมา

---

### วิธีที่ 2: Manual ด้วย psql

#### Local:
```bash
# 1. ดู URL
cat .env.local | grep DIRECT_URL

# 2. Connect และรัน SQL
psql "your-direct-url" -f prisma/migrations/manual_activity_logs.sql
```

#### Production:
```bash
# 1. ดู URL
cat .env.prod | grep DIRECT_URL

# 2. Connect และรัน SQL
psql "your-direct-url" -f prisma/migrations/manual_activity_logs.sql
```

---

## หลัง Migration

```bash
# Generate Prisma Client
npm run prisma:generate

# หรือ
npx prisma generate
```

---

## ทดสอบ

```bash
# Run dev server
npm run dev

# เปิดหน้า logs
# http://localhost:3000/admin/logs
```

---

## Production Deployment

```bash
git add .
git commit -m "Add activity logs migration"
git push origin main
```

Vercel จะ auto-deploy

---

## ปัญหาที่พบบ่อย

### ❌ "relation activity_logs already exists"
→ ตารางถูกสร้างแล้ว ไม่ต้องทำอะไร

### ❌ "Property 'activityLog' does not exist"
→ รัน: `npm run prisma:generate`

### ❌ "permission denied"
→ ใช้ `DIRECT_URL` ไม่ใช่ `DATABASE_URL`

---

## เอกสารเพิ่มเติม

ดู: `docs/MIGRATION_GUIDE.md` สำหรับรายละเอียดเต็ม

---

## Quick Commands

```bash
# Migrate
npm run db:migrate-logs

# Generate
npm run prisma:generate

# Test
npm run dev

# Deploy
git push
```

เสร็จแล้ว!
