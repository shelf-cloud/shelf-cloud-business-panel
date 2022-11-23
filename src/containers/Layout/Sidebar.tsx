import React, { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import SimpleBar from 'simplebar-react'
import 'simplebar/dist/simplebar.min.css'
//import logo
import ShelfCloudLogo from '../../assets/images/shelfcloud-white-h.png'

//Import Components
import VerticalLayout from './VerticalLayout'
import { Container } from 'reactstrap'

type Props = {
  layoutType: string
}

const Sidebar = ({ layoutType }: Props) => {
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
      <div className="app-menu navbar-menu">
        <div className="navbar-brand-box p-2">
          <Link href="/" passHref>
            <a>
              <div className="w-100 position-relative">
                <Image
                  className="rounded-3"
                  src={ShelfCloudLogo}
                  layout="intrinsic"
                  alt="ShelfCloud Logo"
                  objectFit="contain"
                />
              </div>
            </a>
          </Link>
        </div>
        {layoutType === 'horizontal' ? (
          <div id="scrollbar">
            <Container fluid>
              <div id="two-column-menu"></div>
              <ul className="navbar-nav" id="navbar-nav">
                {/* <HorizontalLayout /> */}
              </ul>
            </Container>
          </div>
        ) : layoutType === 'twocolumn' ? (
          <React.Fragment>
            {/* <TwoColumnLayout layoutType={layoutType} /> */}
            <div className="sidebar-background"></div>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <SimpleBar id="scrollbar" className="h-100">
              <Container fluid>
                <div id="two-column-menu"></div>
                <ul className="navbar-nav" id="navbar-nav">
                  <VerticalLayout />
                </ul>
              </Container>
            </SimpleBar>
            <div className="sidebar-background"></div>
          </React.Fragment>
        )}
      </div>
      <div className="vertical-overlay"></div>
    </React.Fragment>
  )
}

export default Sidebar
