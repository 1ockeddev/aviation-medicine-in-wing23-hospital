/**
 * Analyze Export File
 * 
 * วิเคราะห์ไฟล์ export เพื่อหาปัญหา categories
 * 
 * วิธีใช้:
 * node scripts/analyze-export.js path/to/export.json
 */

const fs = require('fs');
const path = require('path');

// อ่านไฟล์ export
const filePath = process.argv[2];

if (!filePath) {
  console.error('❌ กรุณาระบุไฟล์ export');
  console.log('วิธีใช้: node scripts/analyze-export.js path/to/export.json');
  process.exit(1);
}

const fullPath = path.resolve(filePath);

if (!fs.existsSync(fullPath)) {
  console.error('❌ ไม่พบไฟล์:', fullPath);
  process.exit(1);
}

console.log('📂 อ่านไฟล์:', fullPath);
const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

const categories = data.data.categories || [];

console.log('\n📊 สรุปข้อมูล:');
console.log('  - Categories:', categories.length);
console.log('  - Medications:', data.data.medications?.length || 0);
console.log('  - LINE Users:', data.data.lineUsers?.length || 0);

// สร้าง Set ของ category IDs
const categoryIds = new Set(categories.map(c => c.id));

// หา root categories
const rootCategories = categories.filter(c => !c.parentId || c.parentId === '');

console.log('\n🌳 Root Categories (ไม่มี parent):', rootCategories.length);
rootCategories.forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.name} (${c.id})`);
});

// หา orphaned categories
const orphanedCategories = categories.filter(c => 
  c.parentId && c.parentId !== '' && !categoryIds.has(c.parentId)
);

console.log('\n⚠️  Orphaned Categories (parent หายไป):', orphanedCategories.length);
orphanedCategories.forEach((c, i) => {
  console.log(`  ${i + 1}. ${c.name}`);
  console.log(`     ID: ${c.id}`);
  console.log(`     Parent ID: ${c.parentId} (ไม่มีในไฟล์)`);
  console.log(`     Parent ID type: ${typeof c.parentId}`);
  console.log(`     Parent ID empty string: ${c.parentId === ''}`);
  console.log('');
});

// หา categories ที่มีชื่อตามที่ error บอก
const problematicNames = [
  'Gastro-intestinal system',
  'Antacids and other drugs for dyspepsia',
  'Antispasmodics and other drugs altering gut motility'
];

console.log('\n🔍 Categories ที่มีปัญหา (ตาม error):');
problematicNames.forEach(name => {
  const cat = categories.find(c => c.name === name);
  if (cat) {
    console.log(`\n  ✓ ${cat.name}`);
    console.log(`    ID: ${cat.id}`);
    console.log(`    Parent ID: ${cat.parentId}`);
    console.log(`    Parent ID type: ${typeof cat.parentId}`);
    console.log(`    Parent ID === '': ${cat.parentId === ''}`);
    console.log(`    Parent ID === null: ${cat.parentId === null}`);
    
    if (cat.parentId && cat.parentId !== '') {
      const parent = categories.find(p => p.id === cat.parentId);
      if (parent) {
        console.log(`    Parent exists: ✓ ${parent.name}`);
      } else {
        console.log(`    Parent exists: ✗ NOT FOUND`);
      }
    } else {
      console.log(`    Parent: (root category)`);
    }
  } else {
    console.log(`\n  ✗ "${name}" - ไม่พบในไฟล์`);
  }
});

// สร้าง hierarchy tree
console.log('\n🌲 Hierarchy Analysis:');
const buildTree = (parentId, level = 0) => {
  const children = categories.filter(c => c.parentId === parentId);
  return children.forEach(child => {
    console.log('  '.repeat(level) + `- ${child.name} (${child.id})`);
    buildTree(child.id, level + 1);
  });
};

console.log('\n  Root level:');
buildTree(null, 1);

// แนะนำวิธีแก้
console.log('\n💡 วิธีแก้ไข:');
if (orphanedCategories.length > 0) {
  console.log('  มี orphaned categories', orphanedCategories.length, 'รายการ');
  console.log('  → ระบบควรย้ายไปไว้ที่ root level อัตโนมัติ');
  console.log('  → แต่ดูเหมือนว่าระบบไม่ทำงาน');
  console.log('');
  console.log('  ตรวจสอบ:');
  console.log('  1. parentId เป็น string ว่างหรือ null?');
  console.log('  2. ระบบตรวจจับ orphaned categories ถูกต้องหรือไม่?');
  console.log('  3. ดู console logs ใน browser มี "Found orphaned category" หรือไม่?');
} else {
  console.log('  ไม่พบ orphaned categories');
  console.log('  → ปัญหาอาจอยู่ที่ logic การ import');
}

console.log('\n✅ วิเคราะห์เสร็จสิ้น');
