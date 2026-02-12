import { Html, Head, Main, NextScript } from "next/document"

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* DNS prefetch for external APIs — speeds up first request */}
        <link rel="dns-prefetch" href="https://ppio.onrender.com" />
        <link rel="preconnect" href="https://ppio.onrender.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://generativelanguage.googleapis.com" />
        <link rel="dns-prefetch" href="https://clerk.fintola.thebhavesh.me" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Prefetch Python API during idle time to warm Render cold start */}
        <link rel="prefetch" href="https://ppio.onrender.com/api/finance?symbol=RELIANCE.NS&type=chart&period=1mo&interval=1d" as="fetch" crossOrigin="anonymous" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
