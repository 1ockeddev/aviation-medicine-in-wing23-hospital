/**
 * Test Flex Message Script
 * 
 * This script generates a sample Flex Message JSON to test the design
 * 
 * Usage:
 *   npx tsx scripts/test-flex-message.ts
 */

import { createExpirationFlexMessage, formatDate, calculateDaysRemaining } from '@/lib/flex-messages';

// Sample medication data
const sampleMedications = [
  {
    id: '1',
    name: 'Hydralazine hydrochloride\n(ยาเข้าใหม่)',
    tradeName: 'DIOXZYE',
    expirationDate: new Date('2026-08-31'),
    status: 'Y',
    dose: null,
    doseDetails: null,
    halfLife: null,
    sideEffects: null,
    notes: null,
    categoryId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: '1',
      name: '2 Cardiovascular system > 2.5 Drugs affecting the renin-angiotensin system and some other antihypertensive drugs > 2.5.1 Vasodilator antihypertensive drugs',
      order: 1,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
  {
    id: '2',
    name: 'Amlodipine',
    tradeName: 'Norvasc',
    expirationDate: new Date('2026-09-15'),
    status: 'Y',
    dose: '5mg',
    doseDetails: null,
    halfLife: null,
    sideEffects: null,
    notes: null,
    categoryId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
    category: {
      id: '2',
      name: '2 Cardiovascular system > 2.6 Calcium-channel blockers > 2.6.2 Calcium-channel blockers',
      order: 2,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
];

console.log('🧪 Testing Flex Message Generation');
console.log('═'.repeat(60));
console.log('');

// Test with single medication
console.log('📦 Single Medication Flex Message:');
console.log('─'.repeat(60));
const singleFlexMessage = createExpirationFlexMessage([sampleMedications[0]]);
console.log(JSON.stringify(singleFlexMessage, null, 2));
console.log('');

// Test with multiple medications (carousel)
console.log('📦 Multiple Medications Flex Message (Carousel):');
console.log('─'.repeat(60));
const multipleFlexMessage = createExpirationFlexMessage(sampleMedications);
console.log(JSON.stringify(multipleFlexMessage, null, 2));
console.log('');

// Show summary
console.log('📊 Summary:');
console.log('─'.repeat(60));
sampleMedications.forEach((med, index) => {
  const daysRemaining = calculateDaysRemaining(med.expirationDate);
  const expirationDateStr = formatDate(med.expirationDate);
  
  console.log(`Medication ${index + 1}:`);
  console.log(`  Name: ${med.name}`);
  console.log(`  Trade Name: ${med.tradeName}`);
  console.log(`  Category: ${med.category.name}`);
  console.log(`  Expiration: ${expirationDateStr}`);
  console.log(`  Days Remaining: ${daysRemaining} days`);
  console.log('');
});

console.log('✅ Flex Message generation completed!');
console.log('');
console.log('💡 Next steps:');
console.log('  1. Copy the JSON output above');
console.log('  2. Go to LINE Flex Message Simulator: https://developers.line.biz/flex-simulator/');
console.log('  3. Paste the JSON and preview the message');
console.log('  4. Test sending via /admin/line-users page');
console.log('');
console.log('═'.repeat(60));
