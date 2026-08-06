import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'

export default function MyApp({ Component, pageProps }: AppProps) {
  return <>
    <Head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
    </Head>
    <aside className="career-side-mark" aria-hidden="true">
      <span>TOYO CAREER CENTER</span>
    </aside>
    <Component {...pageProps} />
  </>
}
