import '../styles/themes.scss'
import type { AppProps } from 'next/app'
import AppContext from '@context/AppContext'
import { SessionProvider } from '@auth/client'
import { Session } from 'next-auth'
import Layout from '@containers/Layout/Layout'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.min.css'
import useInitialState from '@hooks/useInitialState'

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
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AppContext.Provider>
    </SessionProvider>
  )
}

export default MyApp
