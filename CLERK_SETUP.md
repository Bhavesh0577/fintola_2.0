# Setting Up Clerk Authentication

This document provides instructions on how to set up Clerk authentication for the Fintola application.

## Prerequisites

1. Create a Clerk account at [https://clerk.com](https://clerk.com)
2. Create a new application in the Clerk dashboard

## Configuration Steps

1. **Get your API keys**

   After creating an application in Clerk, navigate to the API Keys section in your Clerk dashboard.
   You'll need two keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

2. **Update your .env.local file**

   Replace the placeholder values in the `.env.local` file with your actual Clerk API keys:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key_from_clerk_dashboard
   CLERK_SECRET_KEY=your_secret_key_from_clerk_dashboard
   ```

3. **Configure your application URLs in Clerk Dashboard**

   In your Clerk Dashboard, go to the "Paths" section and configure:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in URL: `/dash`
   - After sign-up URL: `/dash`

4. **Customize the appearance (optional)**

   You can customize the appearance of the Clerk components by modifying the `appearance` prop in:
   - `src/app/sign-in/[[...sign-in]]/page.tsx`
   - `src/app/sign-up/[[...sign-up]]/page.tsx`
   - `src/app/profile/page.tsx`

## How Authentication Works

1. The middleware in `src/middleware.ts` protects all routes except those specified in `publicRoutes`.
2. When a user tries to access a protected route without being authenticated, they are redirected to the sign-in page.
3. After successful authentication, the user is redirected to the dashboard.
4. The user can sign out using the sign-out button in the sidebar.

## Testing Authentication

1. Start the development server: `npm run dev`
2. Visit the homepage and click "Try Dashboard"
3. You should be redirected to the sign-in page
4. After signing in, you should be redirected to the dashboard

## Troubleshooting

- If you encounter CORS errors, make sure your application domain is added to the allowed origins in your Clerk Dashboard.
- If redirects aren't working correctly, check the URLs configured in your Clerk Dashboard and in the `.env.local` file.
- For more help, refer to the [Clerk documentation](https://clerk.com/docs). 