import type { AppProps } from 'next/app'

import { SessionProvider } from '@auth/client'
import Layout from '@containers/Layout/Layout'
import AppContext from '@context/AppContext'
import useInitialState from '@hooks/useInitialState'
import { Session } from 'next-auth'
import { NuqsAdapter } from 'nuqs/adapters/next/pages'

import { Toaster } from '@/components/shadcn/ui/sonner'
import { TooltipProvider } from '@/components/shadcn/ui/tooltip'

// Plain-CSS chain replacing themes.scss (Bootstrap/Sass removed).
// Order mirrors the old compiled cascade: icon fonts -> Bootstrap-core
// used subset -> fonts -> Velzon component overrides -> plugins -> pages
// -> custom -> themes-custom -> shell -> tailwind.
import '../styles/base/icons.css'
import '../styles/core/reboot.css'
import '../styles/core/grid.css'
import '../styles/base/fonts.css'
import '../styles/components/avatar.css'
import '../styles/components/helper.css'
import '../styles/components/print.css'
import '../styles/components/reboot.css'
import '../styles/components/alerts.css'
import '../styles/components/backgrounds.css'
import '../styles/components/buttons.css'
import '../styles/components/card.css'
import '../styles/components/dropdown.css'
import '../styles/components/nav.css'
import '../styles/components/table.css'
import '../styles/components/modal.css'
import '../styles/components/form-check.css'
import '../styles/plugins/dropzone.css'
import '../styles/plugins/flatpicker.css'
import '../styles/pages/authentication.css'
import '../styles/base/custom.css'
import '../styles/base/themes-custom.css'
import '../styles/shell/tokens.css'
import '../styles/shell/topbar.css'
import '../styles/shell/page-head.css'
import '../styles/shell/footer.css'
import '../styles/shell/vertical.css'
import '../styles/tailwind.css'

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
        <Toaster />
        <NuqsAdapter>
          <TooltipProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </TooltipProvider>
        </NuqsAdapter>
      </AppContext.Provider>
    </SessionProvider>
  )
}

export default MyApp
