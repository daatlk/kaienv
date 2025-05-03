#!/usr/bin/env node

/**
 * This script checks if the required environment variables are set
 * It's used in the GitHub Actions workflow to ensure the build will succeed
 */

const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

let missingVars = [];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    missingVars.push(envVar);
  }
}

if (missingVars.length > 0) {
  console.error('Error: The following required environment variables are missing:');
  missingVars.forEach(variable => {
    console.error(`  - ${variable}`);
  });
  console.error('\nPlease set these variables in your environment or .env file.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set.');
  process.exit(0);
}
