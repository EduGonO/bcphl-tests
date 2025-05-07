import { AppProps } from 'next/app';
import Head from 'next/head';
import '../styles/global.css';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { Analytics } from "@vercel/analytics/react"

interface MyAppProps extends AppProps {
  pageProps: { session?: Session };
}

export default function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <>
      <Head>
        {/* Browser tab title (can be overridden per page) */}
        <title>Bicéphale</title>
        <meta
          name="description"
          content="Revue Bicéphale, 2025"
        />

        {/* Open Graph (Facebook, LinkedIn, Slack, etc.) */}
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="Bicéphale" />
        <meta property="og:title"       content="Bicéphale" />
        <meta property="og:description" content="Revue Bicéphale, 2025" />
        <meta property="og:url"         content="https://bicephale.org" />

        {/* Twitter Card */}
        <meta name="twitter:title"       content="Bicéphale" />
        <meta name="twitter:description" content="Revue Bicéphale, 2025" />

        {/* Favicon from earlier */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="https://raw.githubusercontent.com/EduGonO/bcphl-tests/main/public/favicon.ico" />
      </Head>

      <SessionProvider
        session={pageProps.session}
        refetchInterval={5 * 60}
        refetchOnWindowFocus
      >
        <Component {...pageProps} />
      </SessionProvider>
      <Analytics />
    </>
  );
}