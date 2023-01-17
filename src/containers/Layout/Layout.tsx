import React, { useEffect, useState, ReactElement } from 'react'
import PropTypes from 'prop-types'

//import Components
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import { useRouter } from 'next/router'

interface Props {
  children: ReactElement
}

const Layout = ({ children }: Props) => {
  const [headerClass, setHeaderClass] = useState('')
  const { pathname } = useRouter()
  const noLayout = ['SignIn' , 'ContactForm', 'Forgotpassword']

  useEffect(() => {
    window.addEventListener('scroll', scrollNavigation, true)
  })

  function scrollNavigation() {
    var scrollup = document.documentElement.scrollTop
    if (scrollup > 50) {
      setHeaderClass('topbar-shadow')
    } else {
      setHeaderClass('')
    }
  }

  return (
    <React.Fragment>
      {noLayout.includes(pathname.split('/')[1]) ? (
        <div>{children}</div>
      ) : (
        <div id="layout-wrapper">
          <Header headerClass={headerClass} />
          <Sidebar layoutType={'vertical'} />
          <div className="main-content">
            {children}
            <Footer />
          </div>
        </div>
      )}
    </React.Fragment>
  )
}

Layout.propTypes = {
  children: PropTypes.object,
}

export default Layout
