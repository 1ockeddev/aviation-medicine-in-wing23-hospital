# Changelog: ฟีเจอร์ส่งการแจ้งเตือนยาใกล้หมดอายุ

## สรุปการเปลี่ยนแปลง

เพิ่มฟีเจอร์การส่ง Flex Message จริงที่มีข้อมูลยาที่ใกล้หมดอายุภายใน 30 วันผ่าน LINE Messaging API ในหน้า `/admin/line-users`

## ไฟล์ที่สร้างใหม่

### 1. API Routes
- **`app/api/line/send-expiry-notification/route.ts`**
  - API Endpoint สำหรับส่งการแจ้งเตือนยาใกล้หมดอายุ
  - รองรับ Authentication
  - Return medication count เมื่อสำเร็จ

- **`app/api/line/send-expiry-notification/route.test.ts`**
  - Unit tests สำหรับ API Route
  - ครอบคลุม Authentication, Validation, Success, และ Error Cases

### 2. Tests
- **`lib/line-messaging.expiry.test.ts`**
  - Unit tests สำหรับ `sendExpiryNotification()` function
  - ทดสอบการ Query ยา, สร้าง Flex Message, และส่งข้อความ
  - ทดสอบ Error Handling ทุกกรณี

### 3. Documentation
- **`docs/EXPIRY_NOTIFICATION.md`**
  - คู่มือการใช้งานฟีเจอร์แบบละเอียด
  - วิธีใช้งานผ่าน UI และ API
  - โครงสร้างโค้ด
  - Troubleshooting Guide
  - Best Practices

- **`CHANGELOG_EXPIRY_NOTIFICATION.md`** (ไฟล์นี้)
  - สรุปการเปลี่ยนแปลงทั้งหมด

## ไฟล์ที่แก้ไข

### 1. Backend Logic
- **`lib/line-messaging.ts`**
  - เพิ่ม function `sendExpiryNotification()`
  - ดึงข้อมูลยาที่ใกล้หมดอายุภายใน 30 วัน
  - สร้าง Flex Message และส่งผ่าน LINE API
  - รองรับ medication count ใน Return Type

### 2. UI Components
- **`app/admin/line-users/LineUserList.tsx`**
  - เพิ่ม state `expiryNotificationPending` สำหรับจัดการ Loading
  - เพิ่ม function `handleSendExpiryNotification()` สำหรับส่งการแจ้งเตือน
  - เพิ่มปุ่ม "📋 ส่งรายการยาใกล้หมดอายุ" ในการ์ดแต่ละผู้ใช้
  - แสดง Success Message พร้อมจำนวนยาที่ส่ง
  - แสดง Error Message เมื่อไม่พบยาหรือส่งล้มเหลว

- **`components/ui/Button.tsx`**
  - เพิ่ม variant `'warning'` สำหรับปุ่มส่งการแจ้งเตือน
  - สีส้ม (#F97316) สำหรับเน้นความสำคัญ

### 3. Configuration
- **`vitest.config.ts`**
  - เพิ่ม alias สำหรับ `next/server` เพื่อแก้ปัญหา Module Resolution
  - เพิ่ม `server.deps.inline` สำหรับ `next-auth`
  - ทำให้ Tests รันได้โดยไม่มี Error

## คุณสมบัติที่เพิ่มเข้ามา

### 1. การดึงข้อมูลยา
- Query ยาที่มี `expirationDate` อยู่ระหว่างวันนี้ถึง 30 วันข้างหน้า
- เรียงลำดับตามวันหมดอายุจากเร็วไปช้า
- Include ข้อมูล Category สำหรับแสดงใน Flex Message

### 2. การสร้าง Flex Message
- ใช้ function `createExpirationFlexMessage()` ที่มีอยู่แล้ว
- รองรับทั้ง Single Bubble และ Carousel
- แสดงข้อมูลครบถ้วน:
  - ชื่อยา (Generic Name)
  - ชื่อการค้า (Trade Name)
  - หมวดหมู่แบบ Hierarchy
  - วันหมดอายุพร้อมจำนวนวันที่เหลือ

### 3. การส่งข้อความ
- ส่งผ่าน LINE Messaging API
- แสดง Loading State ขณะส่ง
- แสดงผลลัพธ์แบบ Toast Message

### 4. Error Handling
- ตรวจสอบ Authentication
- Validate lineUserId
- Handle กรณีไม่มียาที่ใกล้หมดอายุ (404)
- Handle LINE API Errors (500)
- Handle Database Errors

### 5. Logging
- Log ทุก Step: Initiated, Success, Failed
- รวม Context ที่สำคัญ: userId, adminUser, medicationCount
- รวม Timestamp สำหรับ Debugging

## การใช้งาน

### ผ่าน UI

1. Login เข้า Admin Panel
2. ไปที่ `/admin/line-users`
3. คลิกปุ่ม "📋 ส่งรายการยาใกล้หมดอายุ" ในการ์ดผู้ใช้
4. รอให้ระบบส่ง
5. ดูผลลัพธ์:
   - สำเร็จ: "ส่งการแจ้งเตือนยาใกล้หมดอายุ X รายการถึง [ชื่อผู้ใช้] เรียบร้อยแล้ว"
   - ไม่มียา: "ไม่พบยาที่ใกล้หมดอายุภายใน 30 วัน"
   - ล้มเหลว: แสดง Error Message

### ผ่าน API

```bash
curl -X POST http://localhost:3000/api/line/send-expiry-notification \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"lineUserId": "U1234567890abcdef1234567890abcdef"}'
```

## Test Coverage

### API Route Tests (6 tests)
✅ ทุก Test ผ่านหมด
- Authentication Tests
- Validation Tests
- Success Cases
- Error Cases

### LINE Messaging Tests (5 tests)
✅ ทุก Test ผ่านหมด
- Query Tests
- Flex Message Creation Tests
- LINE API Integration Tests
- Error Handling Tests

### รัน Tests

```bash
# รัน API Tests
npm test -- app/api/line/send-expiry-notification/route.test.ts --run

# รัน LINE Messaging Tests
npm test -- lib/line-messaging.expiry.test.ts --run

# รัน All Tests
npm test
```

## Breaking Changes

ไม่มี Breaking Changes - ฟีเจอร์นี้เป็นการเพิ่มใหม่โดยไม่กระทบกับโค้ดเดิม

## Dependencies

ไม่มีการติดตั้ง Dependencies ใหม่ - ใช้ Dependencies ที่มีอยู่แล้ว:
- `@prisma/client` - Database ORM
- `next` - Framework
- `next-auth` - Authentication
- `vitest` - Testing

## Performance Considerations

1. **Database Query**
   - Query เฉพาะยาที่ใกล้หมดอายุ (มี WHERE clause)
   - Include เฉพาะ Category ที่จำเป็น
   - Order By expirationDate สำหรับแสดงผลที่ดี

2. **LINE API**
   - ส่งข้อความครั้งละ 1 ผู้ใช้
   - ควรระวัง Rate Limits (500 messages/second)

3. **UI**
   - แสดง Loading State ขณะส่ง
   - Disable ปุ่มเพื่อป้องกันการคลิกซ้ำ
   - Auto-hide Toast Message หลัง 4 วินาที

## Security

1. **Authentication**
   - ตรวจสอบ Admin Session ก่อนส่ง
   - Return 401 หากไม่มี Auth

2. **Authorization**
   - เฉพาะ Admin เท่านั้นที่ส่งได้

3. **Input Validation**
   - ตรวจสอบ lineUserId ว่าไม่เป็น Empty

4. **Logging**
   - Log ทุก Attempt พร้อม adminUser
   - ไม่ Log ข้อมูลที่เป็นความลับ (Channel Access Token)

## Future Improvements

### ที่สามารถทำได้ในอนาคต:

1. **Batch Sending**
   - ส่งให้หลายผู้ใช้พร้อมกัน
   - มีปุ่ม "ส่งให้ทุกคน" ด้านบน

2. **Schedule Notifications**
   - กำหนดเวลาส่งอัตโนมัติ
   - ใช้ Cron Job ส่งทุกเช้า/ทุกสัปดาห์

3. **Notification Preferences**
   - ให้ผู้ใช้เลือกว่าต้องการรับแจ้งเตือนหรือไม่
   - เก็บใน `notificationsEnabled` field

4. **Custom Date Range**
   - ให้ Admin เลือกช่วงเวลาได้ (7, 14, 30, 60 วัน)

5. **Rich Statistics**
   - แสดงจำนวนยาที่ใกล้หมดอายุในหน้า Dashboard
   - แสดงกราฟแนวโน้ม

6. **Email Integration**
   - รองรับการส่ง Email นอกจาก LINE

## Support

หากพบปัญหาหรือมีคำถาม:
1. อ่าน [EXPIRY_NOTIFICATION.md](docs/EXPIRY_NOTIFICATION.md)
2. ตรวจสอบ Console Logs
3. รัน Tests เพื่อตรวจสอบว่า System ทำงานถูกต้อง

## Contributors

- Developer: [Your Name]
- Date: 2024-07-16
- Version: 1.0.0
