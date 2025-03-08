const fs = require('fs');
const path = require('path');

// Ensure environment variables are set
const envVars = {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: 'pk_test_ZmluZS1hbnRlbG9wZS05MC5jbGVyay5hY2NvdW50cy5kZXYk',
    CLERK_SECRET_KEY: 'sk_test_iLpQHUMEsg5Es5zwSk0Wa7X3tYJ43mgrjSkpGBvHzd',
    NEXT_PUBLIC_CLERK_SIGN_IN_URL: '/sign-in',
    NEXT_PUBLIC_CLERK_SIGN_UP_URL: '/sign-up',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: '/dash',
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: '/dash',
};

// Create .env files
const envFiles = [
    '.env',
    '.env.local',
    '.env.production',
    '.env.production.local',
    '.env.build',
];

// Create the content for the .env files
const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

// Write the content to each .env file
envFiles.forEach((file) => {
    fs.writeFileSync(path.join(process.cwd(), file), envContent);
    console.log(`Created ${file}`);
});

console.log('Environment variables set up for deployment'); 