/**
 * Test Cron Job Script
 * 
 * Usage:
 *   npx tsx scripts/test-cron.ts
 *   npx tsx scripts/test-cron.ts --env=production
 */

const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const environment = envArg ? envArg.split('=')[1] : 'local';

const urls: Record<string, string> = {
  local: 'http://localhost:3000',
  vercel: 'https://your-project.vercel.app', // Update after deployment
  netlify: 'https://aviation-medicine-in-wing23-hospital.netlify.app',
  production: 'https://your-project.vercel.app', // Update after deployment
};

const CRON_SECRET = process.env.CRON_SECRET || '4T+uTdfZRpZQeFxWmh3RFKZnicnKTy4Ir7t8QZbMB4A=';
const baseUrl = urls[environment] || urls.local;
const endpoint = `${baseUrl}/api/cron/check-expiry`;

console.log('🧪 Testing Cron Job');
console.log('─'.repeat(50));
console.log(`Environment: ${environment}`);
console.log(`Endpoint: ${endpoint}`);
console.log(`CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...`);
console.log('─'.repeat(50));
console.log('');

async function testCronJob() {
  const startTime = Date.now();
  
  try {
    console.log('⏳ Sending request...');
    
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CRON_SECRET}`,
      },
    });

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const data = await response.json();

    console.log('');
    console.log('📊 Response:');
    console.log('─'.repeat(50));
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Duration: ${duration}ms`);
    console.log('');
    
    if (response.ok) {
      console.log('✅ SUCCESS!');
      console.log('');
      console.log('Results:');
      console.log(`  - Notifications sent: ${data.notificationsSent || 0}`);
      console.log(`  - Backend duration: ${data.duration || 'N/A'}ms`);
      console.log('');
      console.log('Full response:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('❌ FAILED!');
      console.log('');
      console.log('Error:');
      console.log(`  - ${data.error || 'Unknown error'}`);
      if (data.details) {
        console.log(`  - Details: ${data.details}`);
      }
      console.log('');
      console.log('Full response:');
      console.log(JSON.stringify(data, null, 2));
      
      console.log('');
      console.log('💡 Troubleshooting tips:');
      if (response.status === 401) {
        console.log('  - Check CRON_SECRET is correct');
        console.log('  - Verify environment variable is set');
      } else if (response.status === 500) {
        console.log('  - Check database connection');
        console.log('  - Verify LINE credentials are set');
        console.log('  - Check server logs for detailed error');
      }
    }
    
    console.log('');
    console.log('─'.repeat(50));
    
  } catch (error) {
    console.log('');
    console.log('❌ REQUEST FAILED!');
    console.log('');
    console.log('Error:', error instanceof Error ? error.message : error);
    console.log('');
    console.log('💡 Possible causes:');
    console.log('  - Server is not running (for local)');
    console.log('  - Incorrect URL');
    console.log('  - Network connectivity issue');
    console.log('  - CORS policy (try curl instead)');
    
    process.exit(1);
  }
}

testCronJob();
