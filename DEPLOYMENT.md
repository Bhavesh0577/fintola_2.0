# Deployment Instructions for Fintola

This document provides instructions for deploying the Fintola application with Clerk authentication.

## Prerequisites

1. A Vercel account
2. A Clerk account with an application set up

## Deployment Steps

### 1. Set up Environment Variables in Vercel

When deploying to Vercel, make sure to add the following environment variables:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZmluZS1hbnRlbG9wZS05MC5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_iLpQHUMEsg5Es5zwSk0Wa7X3tYJ43mgrjSkpGBvHzd
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dash
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dash
```

### 2. Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. Deploy the application

### 3. Configure Clerk

1. In your Clerk Dashboard, go to the "Paths" section and configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dash`
   - After sign-up URL: `/dash`

2. Add your deployed domain to the list of allowed origins in your Clerk Dashboard

## Troubleshooting

If you encounter any issues during deployment, check the following:

1. Ensure all environment variables are correctly set in Vercel
2. Check that your Clerk application is properly configured
3. Verify that the domain of your deployed application is added to the allowed origins in Clerk

## Local Development

For local development, make sure you have a `.env.local` file with the same environment variables as listed above.

Run the development server:

```bash
npm run dev
```

## Building for Production

To build the application for production:

```bash
npm run build
```

This will create an optimized production build in the `.next` directory. 