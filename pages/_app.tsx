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
    <SessionProvider session={pageProps.session} refetchInterval={0}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;