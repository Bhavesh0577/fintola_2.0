# Vercel Deployment Guide for Fintola

This guide provides step-by-step instructions for deploying Fintola to Vercel with Clerk authentication.

## Prerequisites

1. A Vercel account
2. A GitHub repository with your Fintola code
3. A Clerk account with an application set up

## Deployment Steps

### 1. Prepare Your Repository

Make sure your repository includes:
- All the necessary code files
- The `.env.local` file (for local development only, don't commit this)
- The `vercel.json` file (for Vercel configuration)
- The `next.config.mjs` file (for Next.js configuration)

### 2. Connect to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: next build
   - Output Directory: .next

### 3. Configure Environment Variables

Add the following environment variables in the Vercel project settings:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmluZS1hbnRlbG9wZS05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_iLpQHUMEsg5Es5zwSk0Wa7X3tYJ43mgrjSkpGBvHzd
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dash
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dash
```

### 4. Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Once deployed, Vercel will provide you with a URL for your application

### 5. Configure Clerk

1. Go to your Clerk Dashboard
2. Navigate to the "Domains" section
3. Add your Vercel deployment URL as an allowed domain
4. Make sure the redirect URLs are properly configured

## Troubleshooting

If you encounter any issues during deployment:

1. Check the Vercel build logs for errors
2. Ensure all environment variables are correctly set
3. Verify that your Clerk application is properly configured
4. Check that the middleware is correctly set up

## Local Development

For local development:

1. Create a `.env.local` file with the same environment variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server

## Updating Your Deployment

To update your deployment:

1. Push changes to your GitHub repository
2. Vercel will automatically rebuild and redeploy your application

## Important Notes

- Never commit sensitive information like API keys to your repository
- Use environment variables for all sensitive information
- Keep your Clerk API keys secure 