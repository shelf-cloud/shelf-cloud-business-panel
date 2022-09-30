import React, { useState } from 'react'
import { signOut, useSession } from '@auth/client'
import Image from 'next/image'
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
} from 'reactstrap'

//import images
import avatar1 from '../../assets/images/avatar-5.jpg'

const ProfileDropdown = () => {
  const { data: session } = useSession()

  //Dropdown Toggle
  const [isProfileDropdown, setIsProfileDropdown] = useState(false)
  const toggleProfileDropdown = () => {
    setIsProfileDropdown(!isProfileDropdown)
  }

  return (
    <React.Fragment>
      <Dropdown
        isOpen={isProfileDropdown}
        toggle={toggleProfileDropdown}
        className="ms-sm-3 header-item topbar-user"
      >
        <DropdownToggle tag="button" type="button" className="btn">
          <span className="d-flex align-items-center">
            <Image
              className="rounded-circle header-profile-user"
              src={avatar1}
              width={35}
              height={35}
              alt="Header Avatar"
            />
            <span className="text-start ms-xl-2">
              <span className="d-none d-xl-inline-block ms-1 fw-medium user-name-text">
                {session?.user?.name}
              </span>
              <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">
                Manager
              </span>
            </span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-end">
          <h6 className="dropdown-header">Welcome {session?.user?.name}!</h6>
          <DropdownItem href="/profile">
            <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
            <span className="align-middle">Profile</span>
          </DropdownItem>
          <div className="dropdown-divider"></div>
          <DropdownItem href="/logout">
            <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>{' '}
            <span className="align-middle" data-key="t-logout" onClick={() => signOut({ callbackUrl: '/api/auth/signin' })}>
              Logout
            </span>
          </DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  )
}

export default ProfileDropdown
