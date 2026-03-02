#!/usr/bin/env node

/**
 * Firebase Production Setup Script
 * 
 * This script helps you configure Firebase Admin SDK for production.
 * It will guide you through setting up environment variables.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_LOCAL_PATH = path.join(__dirname, '..', '.env.local');
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

async function main() {
  log('\n🔥 Ghost Collab - Firebase Production Setup\n', 'bright');
  log('This script will help you configure Firebase Admin SDK for production.\n');

  // Check if .env.local exists
  let envContent = '';
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    envContent = fs.readFileSync(ENV_LOCAL_PATH, 'utf8');
    log('✓ Found existing .env.local file\n', 'green');
  } else {
    log('📝 Creating new .env.local file...\n', 'yellow');
  }

  // Get Firebase credentials
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('Step 1: Firebase Credentials', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  log('Get these from Firebase Console:');
  log('1. Go to: https://console.firebase.google.com/');
  log('2. Select your project');
  log('3. Settings ⚙️ → Project settings → Service accounts');
  log('4. Click "Generate new private key"\n');

  const projectId = await question('Enter NEXT_PUBLIC_FIREBASE_PROJECT_ID: ');
  const clientEmail = await question('Enter FIREBASE_CLIENT_EMAIL: ');
  const privateKey = await question('Enter FIREBASE_PRIVATE_KEY (paste entire key): ');

  // Get Gemini API key
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('Step 2: Gemini API Key', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  log('Get from: https://makersuite.google.com/app/apikey\n');
  const geminiApiKey = await question('Enter GEMINI_API_KEY (or press Enter to skip): ');

  // Get Email service
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('Step 3: Email Service', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  log('Choose one:');
  log('1. Resend (Recommended) - https://resend.com/api-keys');
  log('2. SendGrid - https://app.sendgrid.com/settings/api_keys');
  log('3. Skip for now\n');
  const emailChoice = await question('Enter choice (1/2/3): ');

  let resendApiKey = '';
  let emailFrom = 'Ghost Collab <noreply@ghost-collab.tech>';

  if (emailChoice === '1') {
    resendApiKey = await question('Enter RESEND_API_KEY: ');
  } else if (emailChoice === '2') {
    const sendgridApiKey = await question('Enter SENDGRID_API_KEY: ');
    // Will be added to env content
    envContent = updateEnvVar(envContent, 'SENDGRID_API_KEY', sendgridApiKey);
  }

  // Update .env.local
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('Step 4: Writing Configuration', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  envContent = updateEnvVar(envContent, 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', projectId);
  envContent = updateEnvVar(envContent, 'FIREBASE_CLIENT_EMAIL', clientEmail);
  envContent = updateEnvVar(envContent, 'FIREBASE_PRIVATE_KEY', privateKey);
  
  if (geminiApiKey) {
    envContent = updateEnvVar(envContent, 'GEMINI_API_KEY', geminiApiKey);
  }
  
  if (resendApiKey) {
    envContent = updateEnvVar(envContent, 'RESEND_API_KEY', resendApiKey);
    envContent = updateEnvVar(envContent, 'EMAIL_FROM', emailFrom);
  }

  fs.writeFileSync(ENV_LOCAL_PATH, envContent);
  log('✓ Configuration saved to .env.local\n', 'green');

  // Verify setup
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('Step 5: Verifying Setup', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const missingVars = [];
  if (!projectId) missingVars.push('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!clientEmail) missingVars.push('FIREBASE_CLIENT_EMAIL');
  if (!privateKey) missingVars.push('FIREBASE_PRIVATE_KEY');

  if (missingVars.length > 0) {
    log('⚠️  Warning: Some required variables are missing:\n', 'yellow');
    missingVars.forEach((v) => log(`   - ${v}`, 'yellow'));
    log('\nPlease update .env.local manually.\n', 'yellow');
  } else {
    log('✓ All required Firebase variables are set!\n', 'green');
    log('Next steps:\n', 'bright');
    log('1. Run: npm run dev');
    log('2. Look for: "✅ Firebase Admin SDK initialized successfully"');
    log('3. Test authentication and Firestore operations\n');
  }

  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'blue');
  log('Setup Complete!', 'bright');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  rl.close();
}

function updateEnvVar(content, key, value) {
  const regex = new RegExp(`${key}=.*`, 'g');
  if (content.match(regex)) {
    return content.replace(regex, `${key}=${value}`);
  } else {
    return content + `\n${key}=${value}`;
  }
}

// Run the script
main().catch((err) => {
  log(`\n❌ Error: ${err.message}\n`, 'red');
  process.exit(1);
});
