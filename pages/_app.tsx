import { AppProps } from 'next/app';
import '../styles/global.css';
import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';

interface MyAppProps extends AppProps {
  pageProps: {
    session?: Session;
  }
}

function MyApp({ Component, pageProps }: MyAppProps) {
  return (
    <SessionProvider 
      session={pageProps.session} 
      // Refetch session every 5 minutes
      refetchInterval={5 * 60}
      // Refetch when window focuses
      refetchOnWindowFocus={true}
    >
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;