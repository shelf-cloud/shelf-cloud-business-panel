import '../styles/themes.scss'
import type { AppProps } from 'next/app'
import AppContext from '@context/AppContext'
import useInitialState from '@hooks/useInitialState.js'
import { SessionProvider } from '@auth/client'
import { Session } from 'next-auth'
import Layout from '@containers/Layout/Layout'

function MyApp({
  Component,
  pageProps,
}: AppProps<{
  session: Session
}>) {
  const initialState = useInitialState()
  return (
    <SessionProvider session={pageProps.session}>
      <AppContext.Provider value={initialState}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppContext.Provider>
    </SessionProvider>
  )
}

export default MyApp
