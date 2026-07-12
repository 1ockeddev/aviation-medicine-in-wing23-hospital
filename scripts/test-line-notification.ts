/**
 * Test Script for LINE Notification
 * 
 * Usage:
 * 1. Make sure your .env.local has LINE credentials
 * 2. Run: npx tsx scripts/test-line-notification.ts
 */

import { sendTestNotification } from '@/lib/line-messaging';

async function main() {
  // Replace with actual LINE User ID from your database
  const lineUserId = 'YOUR_LINE_USER_ID_HERE';
  
  console.log('Sending test notification to:', lineUserId);
  
  const result = await sendTestNotification(lineUserId);
  
  if (result.success) {
    console.log('✅ Test notification sent successfully!');
  } else {
    console.error('❌ Failed to send test notification:', result.error);
  }
}

main().catch((error) => {
  console.error('Script error:', error);
  process.exit(1);
});
