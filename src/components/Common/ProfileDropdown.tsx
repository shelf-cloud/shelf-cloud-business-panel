import React, { useState } from 'react'
import { signOut, useSession } from '@auth/client'
import Image from 'next/image'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap'
import Link from 'next/link'

//import images
import avatar1 from '../../assets/images/avatar-shelfcloud.png'
import { useRouter } from 'next/router'

const ProfileDropdown = () => {
  const { data: session } = useSession()
  const router = useRouter()
  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false)
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown)
  }

  return (
    <React.Fragment>
      {session?.user?.name ? (
        <Dropdown
          isOpen={isProfileDropdown}
          toggle={toggleProfileDropdown}
          className="ms-sm-3 header-item rounded-5"
          style={{backgroundColor: 'rgba(239, 243, 246, 0.5)'}}
        >
          <DropdownToggle tag="button" type="button" className="btn">
            <span className="d-flex align-items-center justify-content-between gap-2">
              <span className="text-end">
                <span className="d-none d-lg-inline-block fs-5 m-0 fw-medium user-name-text text-capitalize">
                  {session?.user?.name}
                </span>
                <span className="d-none d-lg-block fs-6 m-0 text-muted user-name-sub-text">
                  Manager
                </span>
              </span>
              <Image
                className="rounded-circle header-profile-user"
                src={avatar1}
                width={40}
                height={40}
                alt="Header Avatar"
              />
            </span>
          </DropdownToggle>
          <DropdownMenu className="dropdown-menu-end">
            <h6 className="dropdown-header text-capitalize">
              Welcome {session?.user?.name}!
            </h6>
            <DropdownItem onClick={() => router.push('/Profile')}>
              <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Profile</span>
            </DropdownItem>
            <DropdownItem onClick={() => router.push('/ContactUs')}>
              <i className="mdi mdi-email-fast text-muted fs-16 align-middle me-1"></i>
              <span className="align-middle">Contact Us</span>
            </DropdownItem>
            <div className="dropdown-divider"></div>
            <DropdownItem onClick={() => signOut()}>
              <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{' '}
              <span
                className="align-middle"
                data-key="t-logout"
                // onClick={() => signOut()}
              >
                Logout
              </span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Link href={'/api/auth/signin'}>
          <h5
            className="fs-5 fw-semibold text-primary"
            style={{ cursor: 'pointer' }}
          >
            Sign In
          </h5>
        </Link>
      )}
    </React.Fragment>
  )
}

export default ProfileDropdown
