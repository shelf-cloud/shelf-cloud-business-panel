import React, { useEffect } from 'react'
import Image from "next/image"
import Link from 'next/link'
import { signOut } from '@auth/client'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
//import logo
import ShelfCloudLogo from '../../assets/images/shelfcloud-white-h.png'
import ShelfCloudLogoSolo from '../../assets/images/shelfcloud-white-solo.png'

//Import Components
import VerticalLayout from './VerticalLayout'
import { Container } from 'reactstrap'

type Props = {
  layoutType: string
}

const Sidebar = ({}: Props) => {
  useEffect(() => {
    var verticalOverlay = document.getElementsByClassName('vertical-overlay')
    if (verticalOverlay) {
      verticalOverlay[0].addEventListener('click', function () {
        document.body.classList.remove('vertical-sidebar-enable')
      })
    }
  })

  // const addEventListenerOnSmHoverMenu = () => {
  //   // add listener Sidebar Hover icon on change layout from setting
  //   if (
  //     document.documentElement.getAttribute('data-sidebar-size') === 'sm-hover'
  //   ) {
  //     document.documentElement.setAttribute(
  //       'data-sidebar-size',
  //       'sm-hover-active'
  //     )
  //   } else if (
  //     document.documentElement.getAttribute('data-sidebar-size') ===
  //     'sm-hover-active'
  //   ) {
  //     document.documentElement.setAttribute('data-sidebar-size', 'sm-hover')
  //   } else {
  //     document.documentElement.setAttribute('data-sidebar-size', 'sm-hover')
  //   }
  // }

  return (
    <React.Fragment>
      <div className='app-menu navbar-menu'>
        <div className='navbar-brand-box p-2'>
          <Link href='/' passHref>
            <a className='logo'>
              <span className='w-100 position-relative logo-sm'>
                <Image
                  className='rounded-3'
                  src={ShelfCloudLogoSolo}
                  alt='ShelfCloud Logo'
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain"
                  }} />
              </span>
              <span className='w-100 position-relative logo-lg'>
                <Image
                  className='rounded-3'
                  src={ShelfCloudLogo}
                  alt='ShelfCloud Logo'
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                    objectPosition: "center"
                  }} />
              </span>
            </a>
          </Link>
        </div>
        <React.Fragment>
          <SimpleBar id='scrollbar' className=''>
            <Container fluid>
              <div id='two-column-menu'></div>
              <ul className='navbar-nav' id='navbar-nav'>
                <VerticalLayout />
              </ul>
            </Container>
          </SimpleBar>
          <div className='logout_container' onClick={() => signOut()}>
            <i className='mdi mdi-logout'></i>
            <span>Logout</span>
          </div>
        </React.Fragment>
      </div>
      <div className='vertical-overlay'></div>
    </React.Fragment>
  );
}

export default Sidebar
