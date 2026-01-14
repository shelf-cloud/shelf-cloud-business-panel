import type { AppProps } from 'next/app'

import { SessionProvider } from '@auth/client'
import Layout from '@containers/Layout/Layout'
import AppContext from '@context/AppContext'
import useInitialState from '@hooks/useInitialState'
import { Session } from 'next-auth'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'

import '../styles/themes.scss'

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
        <ToastContainer />
        <NuqsAdapter>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </NuqsAdapter>
      </AppContext.Provider>
    </SessionProvider>
  )
}

export default MyApp
