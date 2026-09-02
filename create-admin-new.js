// Bootstrap first admin account via Go backend API
const readline = require('readline');

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://zantri.onrender.com';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

async function bootstrapAdmin() {
  try {
    console.log('\n🔧 Zantri Admin Bootstrap');
    console.log('=========================\n');
    console.log(`API: ${API_BASE_URL}\n`);

    const secret = await askQuestion('Admin bootstrap secret (ADMIN_SECRET from Go backend): ');
    const username = await askQuestion('Admin username: ');
    const mobileNumber = await askQuestion('Admin mobile number: ');
    const password = await askQuestion('Admin password (min 6 chars): ');

    if (!secret || !mobileNumber || password.length < 6) {
      console.log('\n❌ Secret, mobile number, and password (6+ chars) are required.');
      return;
    }

    console.log('\n🔄 Creating admin account...');

    const response = await fetch(`${API_BASE_URL}/admin/bootstrap`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret,
        username: username || `admin_${mobileNumber}`,
        mobileNumber,
        password,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.log('\n❌ Failed:', data.error || 'Unknown error');
      return;
    }

    console.log('\n✅ Admin account created successfully!');
    console.log('📱 Mobile:', mobileNumber);
    console.log('\n🚀 Start the admin panel: npm start');
    console.log('   Login with the mobile number and password above.');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nMake sure the Go backend is running on', API_BASE_URL);
  } finally {
    rl.close();
  }
}

bootstrapAdmin();
