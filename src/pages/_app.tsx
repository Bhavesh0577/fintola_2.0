import { AppProps } from 'next/app';
import { ClerkProvider } from '@clerk/nextjs';
import '../app/globals.css';

// Get the publishable key from the environment variable
// This needs to be a constant at build time for proper deployment
const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

if (!publishableKey) {
  console.error("Missing Clerk publishable key. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable.");
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      appearance={{
        elements: {
          formButtonPrimary: 'bg-purple-600 hover:bg-purple-700',
          footerAction: 'text-purple-600 hover:text-purple-800',
          card: 'shadow-sm',
        },
      }}
    >
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default MyApp; 