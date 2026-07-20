/**
 * Fix Export File - Merge Duplicate Categories
 * 
 * แก้ไขปัญหา duplicate categories โดยรวม ID เก่าและใหม่เข้าด้วยกัน
 * 
 * วิธีใช้:
 * node scripts/fix-export.js path/to/export.json path/to/fixed-export.json
 */

const fs = require('fs');
const path = require('path');

const inputPath = process.argv[2];
const outputPath = process.argv[3];

if (!inputPath || !outputPath) {
  console.error('❌ กรุณาระบุไฟล์ input และ output');
  console.log('วิธีใช้: node scripts/fix-export.js input.json output.json');
  process.exit(1);
}

console.log('📂 อ่านไฟล์:', path.resolve(inputPath));
const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const categories = data.data.categories || [];
const medications = data.data.medications || [];

console.log('\n📊 ข้อมูลเดิม:');
console.log('  - Categories:', categories.length);
console.log('  - Medications:', medications.length);

// สร้าง Set ของ category IDs ที่มีอยู่
const categoryIds = new Set(categories.map(c => c.id));

// หา categories ที่มี parentId ไม่อยู่ใน Set
const orphaned = categories.filter(c => 
  c.parentId && c.parentId !== '' && !categoryIds.has(c.parentId)
);

console.log('\n⚠️  Orphaned Categories:', orphaned.length);
orphaned.forEach(c => {
  console.log(`  - ${c.name} (parentId: ${c.parentId})`);
});

// สร้าง mapping ของ old ID -> new ID
const idMapping = {};

// หา duplicate categories (ชื่อเดียวกันแต่ ID ต่างกัน)
const nameToIds = {};
categories.forEach(c => {
  if (!nameToIds[c.name]) {
    nameToIds[c.name] = [];
  }
  nameToIds[c.name].push(c.id);
});

const duplicates = Object.entries(nameToIds).filter(([name, ids]) => ids.length > 1);

console.log('\n🔄 Duplicate Categories:', duplicates.length);
duplicates.forEach(([name, ids]) => {
  console.log(`  - ${name}: ${ids.length} copies`);
  ids.forEach((id, i) => {
    console.log(`    ${i + 1}. ${id}`);
  });
});

// แก้ไข: รวม duplicate categories
const fixedCategories = [];
const processedNames = new Set();

categories.forEach(category => {
  // ถ้าเป็น duplicate ให้ใช้รายการแรกเท่านั้น
  if (nameToIds[category.name].length > 1) {
    if (!processedNames.has(category.name)) {
      // ใช้รายการแรก
      fixedCategories.push(category);
      processedNames.add(category.name);
      
      // เก็บ mapping สำหรับ ID อื่นๆ
      nameToIds[category.name].slice(1).forEach(oldId => {
        idMapping[oldId] = category.id;
      });
    }
  } else {
    fixedCategories.push(category);
  }
});

console.log('\n🔧 ID Mapping (old → new):');
Object.entries(idMapping).forEach(([oldId, newId]) => {
  console.log(`  ${oldId} → ${newId}`);
});

// แก้ไข parentId ตาม mapping
fixedCategories.forEach(category => {
  if (category.parentId && idMapping[category.parentId]) {
    console.log(`  แก้ไข parentId: ${category.name}`);
    console.log(`    เดิม: ${category.parentId}`);
    console.log(`    ใหม่: ${idMapping[category.parentId]}`);
    category.parentId = idMapping[category.parentId];
  }
});

// แก้ไข categoryId ใน medications
let medicationsFixed = 0;
medications.forEach(medication => {
  if (idMapping[medication.categoryId]) {
    medication.categoryId = idMapping[medication.categoryId];
    medicationsFixed++;
  }
});

console.log('\n  Medications fixed:', medicationsFixed);

// ตรวจสอบอีกครั้ง
const fixedCategoryIds = new Set(fixedCategories.map(c => c.id));
const stillOrphaned = fixedCategories.filter(c => 
  c.parentId && c.parentId !== '' && !fixedCategoryIds.has(c.parentId)
);

console.log('\n✓ ตรวจสอบหลังแก้ไข:');
console.log('  - Categories:', fixedCategories.length);
console.log('  - Orphaned Categories:', stillOrphaned.length);

if (stillOrphaned.length > 0) {
  console.log('\n⚠️  ยังมี orphaned categories:');
  stillOrphaned.forEach(c => {
    console.log(`  - ${c.name} (parentId: ${c.parentId})`);
  });
  console.log('\n  → จะถูกย้ายไปไว้ที่ root level โดยอัตโนมัติเมื่อ import');
}

// บันทึกไฟล์ใหม่
const fixedData = {
  ...data,
  data: {
    ...data.data,
    categories: fixedCategories,
    medications: medications,
  },
  counts: {
    ...data.counts,
    categories: fixedCategories.length,
  },
};

fs.writeFileSync(outputPath, JSON.stringify(fixedData, null, 2));

console.log('\n💾 บันทึกไฟล์:', path.resolve(outputPath));
console.log('✅ เสร็จสิ้น!');
console.log('\nขั้นตอนต่อไป:');
console.log('  1. ลอง import ไฟล์ใหม่:', outputPath);
console.log('  2. ตรวจสอบว่า categories เข้า database ครบหรือไม่');
