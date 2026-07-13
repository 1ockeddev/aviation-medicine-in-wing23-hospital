# 🚀 Deploy to Vercel - Quick Start Guide

## ขั้นตอนย้ายจาก Netlify ไป Vercel

### 1. Push Code to GitHub

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push
```

### 2. Import Project to Vercel

1. ไปที่ [Vercel Dashboard](https://vercel.com/dashboard)
2. คลิก **"Add New..."** → **"Project"**
3. เลือก GitHub repository ของคุณ
4. Vercel จะ auto-detect Next.js configuration
5. **อย่ากด Deploy ก่อน!** ไปตั้งค่า Environment Variables ก่อน

### 3. ตั้งค่า Environment Variables

คลิกที่ **Environment Variables** และเพิ่มตัวแปรเหล่านี้:

#### Database (จำเป็น)
```
DATABASE_URL = postgresql://neondb_owner:npg_0fdQ8ngtXirV@ep-curly-resonance-atnsky0d.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require
```
⚠️ **สำคัญ:** ใช้ **Direct Connection** (ไม่มี `-pooler`) จาก Neon Console

#### Authentication (จำเป็น)
```
NEXTAUTH_SECRET = [สร้างใหม่ด้วย: openssl rand -base64 32]
AUTH_SECRET = [ค่าเดียวกับ NEXTAUTH_SECRET]
NEXTAUTH_URL = https://your-project.vercel.app
```
💡 **หมายเหตุ:** สำหรับ NEXTAUTH_URL ให้เว้นไว้ก่อน deploy แล้วค่อยมาตั้งทีหลัง

#### LINE Platform (จำเป็น)
```
LINE_CHANNEL_ID = 2010659099
LINE_CHANNEL_SECRET = 09921893fa2beb8442f0a56e697141ab
LINE_CHANNEL_ACCESS_TOKEN = Vso1zHhlV2tAbcyr3Usbxfysi85Z/2aKFz4/SDOA3d04FW6tAwa+h/TBVDRBMWHULgjYtOEmcRpVhoB6qab3nPP7KdIoWaF8+ZbDtnaOi/MsccvpEnvB6HpMfOvQDQqEjdE0DwjGwmeJWqRDwFMdnwdB04t89/1O/w1cDnyilFU=
```

#### Cron Job Security (จำเป็น)
```
CRON_SECRET = 4T+uTdfZRpZQeFxWmh3RFKZnicnKTy4Ir7t8QZbMB4A=
```

#### Application URL (จำเป็น)
```
NEXT_PUBLIC_APP_URL = https://your-project.vercel.app
```
💡 **หมายเหตุ:** ให้เว้นไว้ก่อน deploy แล้วค่อยมาตั้งทีหลัง

**⚙️ Environment Settings:**
- เลือก: **Production**, **Preview**, และ **Development** ทั้ง 3 ตัว
- ตั้งค่าทุกตัวแปรให้ครบ

### 4. Deploy!

1. คลิก **"Deploy"** button
2. รอ deployment เสร็จ (~2-3 นาที)
3. จดบันทึก URL ที่ได้ เช่น `https://medication-wing23-db.vercel.app`

### 5. อัพเดท Environment Variables ด้วย URL จริง

หลัง deploy เสร็จแล้ว:

1. ไปที่ **Project Settings** → **Environment Variables**
2. แก้ไขตัวแปรเหล่านี้:
   ```
   NEXTAUTH_URL = https://medication-wing23-db.vercel.app
   NEXT_PUBLIC_APP_URL = https://medication-wing23-db.vercel.app
   ```
3. คลิก **"Redeploy"** ใน Deployments tab

### 6. อัพเดท LINE Platform Settings

#### Webhook URL
1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Messaging API channel ของคุณ
3. ไปที่แท็บ **Messaging API**
4. อัพเดท **Webhook URL**:
   ```
   https://medication-wing23-db.vercel.app/api/line/webhook
   ```
5. คลิก **Verify** (ต้องได้ 200 OK)
6. เปิด **Use webhook** toggle

#### LIFF Endpoint URL (ถ้าใช้งาน)
1. ไปที่ LIFF app settings
2. อัพเดท **Endpoint URL**:
   ```
   https://medication-wing23-db.vercel.app/line-register
   ```

### 7. ทดสอบระบบ

#### ทดสอบ Webhook
```bash
curl -X GET https://medication-wing23-db.vercel.app/api/line/webhook \
  -H "Content-Type: application/json" \
  -d '{"events":[]}'
```

#### ทดสอบ Cron Job
```bash
curl -X GET https://medication-wing23-db.vercel.app/api/cron/check-expiry \
  -H "Authorization: Bearer 4T+uTdfZRpZQeFxWmh3RFKZnicnKTy4Ir7t8QZbMB4A="
```

#### ทดสอบ Admin Login
1. เปิด `https://medication-wing23-db.vercel.app/admin`
2. Login ด้วย admin credentials
3. ตรวจสอบว่า LINE Users list ทำงานได้

---

## ✅ Checklist การ Deploy

- [ ] Push code to GitHub
- [ ] Import project to Vercel
- [ ] ตั้งค่า DATABASE_URL (Direct Connection)
- [ ] ตั้งค่า NEXTAUTH_SECRET และ AUTH_SECRET
- [ ] ตั้งค่า LINE credentials (ID, SECRET, ACCESS_TOKEN)
- [ ] ตั้งค่า CRON_SECRET
- [ ] Deploy project
- [ ] อัพเดท NEXTAUTH_URL และ NEXT_PUBLIC_APP_URL
- [ ] Redeploy
- [ ] อัพเดท LINE Webhook URL
- [ ] Verify LINE webhook (200 OK)
- [ ] ทดสอบ cron job
- [ ] ทดสอบ admin login
- [ ] ทดสอบส่ง LINE notification

---

## 🎯 ข้อดีของ Vercel เทียบกับ Netlify

| Feature | Vercel | Netlify |
|---------|--------|---------|
| Next.js Optimization | ⭐⭐⭐ Native | ⭐⭐ Plugin |
| Cron Jobs | ✅ Built-in | ❌ Manual setup |
| Serverless Functions | ✅ Unlimited | ✅ 125k/month (free) |
| Build Time | ⚡ Faster | 🐌 Slower |
| Edge Network | 🌍 Better | 🌍 Good |
| Price (Free Tier) | 💰 Better | 💰 Good |

---

## 📚 เอกสารเพิ่มเติม

สำหรับคำแนะนำโดยละเอียด อ่านที่: [VERCEL_SETUP.md](./docs/VERCEL_SETUP.md)

---

## 🆘 ต้องการความช่วยเหลือ?

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord Community](https://vercel.com/discord)
- [Next.js Discord](https://nextjs.org/discord)
