# Vercel Deployment Guide for Fintola with Clerk Authentication

This guide provides detailed instructions for deploying Fintola to Vercel with Clerk authentication.

## Prerequisites

1. A Vercel account
2. A GitHub repository with your Fintola code
3. A Clerk account with an application set up

## Deployment Steps

### 1. Set Up Environment Variables in Vercel

When deploying to Vercel, you **MUST** add the following environment variables in the Vercel project settings:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmluZS1hbnRlbG9wZS05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_iLpQHUMEsg5Es5zwSk0Wa7X3tYJ43mgrjSkpGBvHzd
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dash
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dash
```

### 2. Deploy to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project settings:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next
   - Install Command: `npm install`

5. Add the environment variables mentioned above in the "Environment Variables" section
6. Click "Deploy"

### 3. Troubleshooting Deployment Issues

If you encounter the "Missing Clerk publishable key" error:

1. Make sure you've added all the environment variables in Vercel
2. Redeploy the project after adding the environment variables
3. If the issue persists, try the following:
   - Go to your Vercel project settings
   - Navigate to the "Environment Variables" section
   - Verify that all the environment variables are correctly set
   - Click on "Redeploy" to rebuild the project with the updated environment variables

### 4. Alternative Deployment Method

If you're still having issues, try this alternative method:

1. Clone your repository locally
2. Run `npm run predeploy` to set up all the environment files
3. Commit and push these changes to your repository
4. Deploy to Vercel again

### 5. Configure Clerk

After successful deployment:

1. Go to your Clerk Dashboard
2. Navigate to the "Domains" section
3. Add your Vercel deployment URL as an allowed domain
4. Make sure the redirect URLs are properly configured

## Important Notes

- The environment variables must be set in Vercel for the deployment to work
- The `deploy.js` script helps ensure all the necessary environment files are created
- The `next.config.mjs` file includes hardcoded environment variables as a fallback
- Never commit sensitive information like API keys to your repository in a production environment

## Local Development

For local development:

1. Create a `.env.local` file with the same environment variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start the development server 