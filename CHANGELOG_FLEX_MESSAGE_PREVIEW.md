# Changelog: Flex Message Preview API & Category Hierarchy Enhancement

## 📅 Date: July 17, 2026

## 🎯 Overview

เพิ่ม API สำหรับ preview Flex Message JSON และปรับปรุงการแสดงผล category hierarchy ให้ครบทุก level

## ✨ Features Added

### 1. Flex Message Preview API (`/api/line/preview-flex`)

**Purpose:** ให้สามารถดึง JSON ของ Flex Message มาทดสอบใน [LINE Flex Message Simulator](https://developers.line.biz/flex-simulator/) ได้

**Endpoints:**
- `GET /api/line/preview-flex` - Preview ยาที่ใกล้หมดอายุภายใน 30 วัน
- `GET /api/line/preview-flex?limit=3` - กำหนดจำนวนยาที่จะแสดง
- `GET /api/line/preview-flex?medicationId=xxx` - Preview ยาเฉพาะรายการ

**Response Format:**
```json
{
  "success": true,
  "medicationCount": 2,
  "flexMessage": {
    "type": "flex",
    "altText": "แจ้งเตือนยาใกล้หมดอายุ 2 รายการ",
    "contents": { ... }
  },
  "instructions": {
    "simulator": "https://developers.line.biz/flex-simulator/",
    "usage": "Copy the 'flexMessage' object..."
  },
  "metadata": {
    "generatedAt": "2026-07-17T...",
    "medications": [...]
  }
}
```

### 2. Category Hierarchy Enhancement

**Problem:** การแสดงหมวดหมู่ยาใน Flex Message ไม่แสดง level ครบของ parent categories

**Solution:**
- ปรับ database query ให้ include parent hierarchy แบบ nested (รองรับสูงสุด 4 levels)
- Build full category path จาก root → leaf (เช่น "Medications > Antibiotics > Oral Forms")
- ใช้ full path ใน Flex Message แทนที่จะใช้แค่ category name เดียว

**Database Query Enhancement:**
```typescript
include: {
  category: {
    include: {
      parent: {
        include: {
          parent: {
            include: {
              parent: true, // Support up to 4 levels
            },
          },
        },
      },
    },
  },
}
```

**Category Path Building:**
```typescript
const ancestors: any[] = [];
let currentCategory: any = med.category;

while (currentCategory) {
  ancestors.unshift(currentCategory); // Add to beginning
  currentCategory = currentCategory.parent;
}

const fullPath = ancestors.map(c => c.name).join(' > ');
```

### 3. Improved Visual Hierarchy in Flex Messages

แก้ไข UI ของ Flex Message ให้แสดง category levels อย่างชัดเจนและใช้โทนสีเดียวกับหน้า web index:

**Color Scheme (matching web UI):**
- **Text Color**: Navy Blue (#232e49) - ใช้สำหรับข้อความหมวดหมู่ทุก level
- **Button Color**: Medium Blue (#61a4ca) - ปุ่ม "ดูรายละเอียดเพิ่มเติม"

**Level 1 (Root/Parent)**
- 📁 Icon
- Background: #ddebf4 (Ice Blue - เหมือนพื้นหลังหน้าเว็บ)
- Text: #232e49 (Navy Blue, bold, sm)
- Padding start: 12px

**Level 2 (Child)**
- 📂 Icon
- Background: #d1e4f0 (Soft Gray - สลับสีจาก level 1)
- Text: #232e49 (Navy Blue, bold, sm)
- Padding start: 28px (เยื้องขวา)

**Level 3 (Grandchild)**
- 📄 Icon
- Background: #bdd9e9 (Soft Blue Gradient Lighter - โทนฟ้าอ่อน)
- Text: #232e49 (Navy Blue, regular, xs)
- Padding start: 44px (เยื้องขวามากขึ้น)

**Level 4+ (Great-grandchild)**
- ▪️ Icon
- Background: #8fbed9 (Soft Blue Gradient Medium - โทนฟ้ากลาง)
- Text: #232e49 (Navy Blue, regular, xs)
- Padding start: 60px (เยื้องขวาสุด)

## 📁 Files Created/Modified

### Created Files:
1. `/app/api/line/preview-flex/route.ts` - API route handler
2. `/app/api/line/preview-flex/route.test.ts` - Tests (9 tests, all passing)
3. `/docs/FLEX_MESSAGE_PREVIEW_API.md` - API documentation
4. `/CHANGELOG_FLEX_MESSAGE_PREVIEW.md` - This file

### Modified Files:
1. `/lib/line-messaging.ts`
   - แก้ไข `sendExpiryNotification()` ให้ include full category hierarchy
   - เพิ่ม logic สำหรับ build category path

2. `/lib/flex-messages.ts`
   - ปรับปรุง visual hierarchy ของ category boxes
   - เพิ่ม icon และ color coding สำหรับแต่ละ level
   - ปรับ spacing และ padding ให้เห็นลำดับชั้นชัดเจน

## 🧪 Tests

**Test Coverage:**
- ✅ Return flex message for medications expiring within 30 days
- ✅ Support medicationId parameter
- ✅ Support limit parameter
- ✅ Build full category hierarchy path
- ✅ Return 404 when no medications found
- ✅ Return 404 with specific hint when medicationId not found
- ✅ Handle database errors gracefully
- ✅ Query medications with correct date range
- ✅ Include full category hierarchy in query

**Test Results:** 9/9 passed ✅

## 🚀 Usage Guide

### Step 1: Start development server
```bash
npm run dev
```

### Step 2: Call Preview API
```bash
# Default: Get medications expiring within 30 days
curl http://localhost:3000/api/line/preview-flex

# With limit
curl http://localhost:3000/api/line/preview-flex?limit=3

# Specific medication
curl http://localhost:3000/api/line/preview-flex?medicationId=clxxxxxx
```

### Step 3: Test in LINE Simulator
1. Open response in browser or API client
2. Copy the `flexMessage` object from response
3. Go to https://developers.line.biz/flex-simulator/
4. Paste JSON and click "Apply"
5. See the preview!

### Step 4: Adjust UI if needed
1. Edit `/lib/flex-messages.ts`
2. Refresh the preview API
3. Copy new JSON to simulator
4. Repeat until satisfied

## 📊 Before & After Comparison

### Before:
```
Category: "Oral Forms"  ❌ (แสดงแค่ level สุดท้าย)
```

### After:
```
📁 Medications
  📂 Antibiotics
    📄 Oral Forms       ✅ (แสดงครบทุก level)
```

## 🔧 Technical Details

### Category Hierarchy Support
- รองรับลำดับชั้นสูงสุด **4 levels**
- Traverse จาก leaf → root แล้ว reverse เป็น root → leaf
- Join ด้วย " > " เป็น full path

### Database Performance
- ใช้ nested `include` แทนการ query หลายรอบ
- Query 1 รอบได้ข้อมูล hierarchy ครบ
- ไม่มี N+1 query problem

### Visual Design Principles
- ใช้สีและ icon แยก level ชัดเจน
- เยื้อง padding เพิ่มตาม level
- Bold สำหรับ level บน, regular สำหรับ level ล่าง
- Box layout แยกแต่ละ level ชัดเจน
- **ใช้โทนสีเดียวกับ web UI** (Navy Blue, Ice Blue, Soft Gray, Soft Blue Gradient)

## 🎨 Color Scheme (matching web UI)

Flex Message ใช้โทนสีเดียวกับหน้า web index เพื่อความสอดคล้องและ professional:

### Web UI Color Constants
```typescript
// From /lib/user-colors.ts
navyBlue: '#232e49'        // Category text
mediumBlue: '#61a4ca'      // Buttons and icons
iceBlue: '#ddebf4'         // Primary background
softGray: '#d1e4f0'        // Alternate background
softBlueGradient: {
  lighter: '#bdd9e9'       // Level 3 background
  medium: '#8fbed9'        // Level 4 background
}
```

### Flex Message Color Mapping
```
Level 1: Ice Blue (#ddebf4)     <- พื้นหลังหลัก
Level 2: Soft Gray (#d1e4f0)    <- สลับสี
Level 3: Soft Blue (#bdd9e9)    <- โทนฟ้าอ่อน
Level 4: Soft Blue (#8fbed9)    <- โทนฟ้ากลาง
Text: Navy Blue (#232e49)       <- ข้อความทุก level
Button: Medium Blue (#61a4ca)   <- ปุ่ม "ดูรายละเอียดเพิ่มเติม"
```

**Benefits:**
- ✅ UI สอดคล้องกันระหว่าง LINE และ Web
- ✅ ผู้ใช้จำสีและ brand ได้ง่าย
- ✅ Professional และ cohesive design
- ✅ โทนสีฟ้า-น้ำเงินให้ความรู้สึกเชื่อถือได้และสะอาด

## 🎨 LINE Flex Message Simulator

**URL:** https://developers.line.biz/flex-simulator/

**Features:**
- Visual preview ของ Flex Message
- Edit JSON แบบ real-time
- Test บนอุปกรณ์ต่างๆ (iOS, Android)
- Export JSON สำหรับใช้งานจริง

## 📝 Notes

1. **Category naming:** ชื่อ category ไม่ควรยาวเกินไป เพราะจะแสดงใน mobile screen
2. **Hierarchy depth:** ถึงแม้จะรองรับ 4 levels แต่แนะนำใช้ไม่เกิน 3 levels เพื่อ UX ที่ดี
3. **Testing:** ควรทดสอบใน Simulator ก่อน deploy จริง
4. **Performance:** Query with nested includes อาจช้าถ้า database มีข้อมูลมาก ควรใช้ index

## 🔗 Related Documentation

- [FLEX_MESSAGE_PREVIEW_API.md](./docs/FLEX_MESSAGE_PREVIEW_API.md) - API usage guide
- [LINE Flex Message Spec](https://developers.line.biz/en/docs/messaging-api/using-flex-messages/)
- [LINE Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)

## ✅ Checklist

- [x] Create Preview API endpoint
- [x] Add full category hierarchy support
- [x] Improve Flex Message visual design
- [x] Write comprehensive tests
- [x] Create documentation
- [x] Test in LINE Simulator
- [ ] Deploy to production
- [ ] Test with real LINE account

## 🚀 Next Steps

1. Deploy changes to production
2. Test API ด้วย production URL
3. Copy JSON ไปวางใน LINE Flex Message Simulator
4. ปรับ UI ตามต้องการ
5. ทดสอบส่ง Flex Message จริงใน LINE
6. รวบรวม feedback จาก users
