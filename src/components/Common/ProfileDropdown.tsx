/* eslint-disable @next/next/no-img-element */
import React, { useContext, useState } from 'react'
import { signOut, useSession } from '@auth/client'
import Image from 'next/image'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from 'reactstrap'
import Link from 'next/link'
import flag_of_europe from '@assets/images/flag_of_europe.png'
import flag_of_usa from '@assets/images/flag_of_usa.png'
import { useRouter } from 'next/router'
import AppContext from '@context/AppContext'

const ProfileDropdown = () => {
  const { data: session } = useSession()
  const { state, setRegion }: any = useContext(AppContext)
  const router = useRouter()

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
          className='ms-sm-3 d-flex align-items-center rounded-4 shadow'
          style={{ backgroundColor: 'rgba(239, 243, 246, 1)' }}>
          <DropdownToggle tag='button' type='button' className='btn'>
            <span className='d-flex align-items-center justify-content-between gap-2'>
              <span className='text-end d-flex flex-column'>
                <span className='d-inline-block fs-5 m-0 fw-medium user-name-text text-capitalize'>{session?.user?.name}</span>
                <span className='inline-block fs-6 m-0 text-muted user-name-sub-text'>{state.currentRegion !== '' && (state.currentRegion == 'us' ? 'USA' : 'EUROPE')}</span>
              </span>
              {state.currentRegion !== '' &&
                (state.currentRegion == 'us' ? (
                  <Image className='rounded-circle header-profile-user' src={flag_of_usa} width={35} height={35} alt='Header Avatar' />
                ) : (
                  <Image className='rounded-circle header-profile-user' src={flag_of_europe} width={35} height={35} alt='Header Avatar' />
                ))}
            </span>
          </DropdownToggle>
          <DropdownMenu className='dropdown-menu-end'>
            <h6 className='dropdown-header text-capitalize'>Welcome {session?.user?.name}!</h6>
            <DropdownItem onClick={() => router.push('/Profile')}>
              <i className='mdi mdi-account-circle text-muted fs-16 align-middle me-1'></i>
              <span className='align-middle'>Profile</span>
            </DropdownItem>
            <DropdownItem onClick={() => router.push('/Settings')}>
              <i className='mdi mdi-tools text-muted fs-16 align-middle me-1'></i>
              <span className='align-middle'>Account Settings</span>
            </DropdownItem>
            {/* <div className='dropdown-divider'></div> */}
            {/* <DropdownItem className='px-2 py-1'>
              {state.currentRegion == 'us' ? (
                <Link
                  href={`https://sellercentral.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.aaa88ff9-b04b-4cc6-88d0-1029e4e271e0&version=beta&redirect_uri=http://localhost:3001/Amazon/AmazonAuthRedirect`}
                  passHref>
                  <a target='blank'>Connect to Amazon</a>
                </Link>
              ) : (
                <div className='bg-light px-2 py-2 rounded shadow'>
                  <img
                    src='https://onixventuregroup.goflow.com/images/channels/amazon.svg'
                    alt='Amazon Image'
                    style={{
                      width: '20px',
                      height: '20px',
                      objectFit: 'contain',
                    }}
                    className='me-1'
                  />
                  <Link
                    href={`https://sellercentral-europe.amazon.com/apps/authorize/consent?application_id=amzn1.sp.solution.aaa88ff9-b04b-4cc6-88d0-1029e4e271e0&version=beta&redirect_uri=http://localhost:3001/Amazon/AmazonAuthRedirect`}
                    passHref>
                    <a target='blank' className='text-black'>
                      Connect Amazon
                    </a>
                  </Link>
                </div>
              )}
            </DropdownItem> */}
            {state.user.hasShelfCloudEu == true && state.user.hasShelfCloudUsa == true && (
              <DropdownItem className='d-flex justify-content-start align-items-center' onClick={state.currentRegion == 'us' ? () => setRegion('eu') : () => setRegion('us')}>
                <div className=' align-middle me-1' style={{ width: '15px', height: '15px' }}>
                  {state.currentRegion == 'eu' ? (
                    <Image className='rounded-circle header-profile-user' src={flag_of_usa} width={16} height={16} alt='Header Avatar' />
                  ) : (
                    <Image className='rounded-circle header-profile-user' src={flag_of_europe} width={16} height={16} alt='Header Avatar' />
                  )}
                </div>
                <div className='align-middle'>Change Location</div>
              </DropdownItem>
            )}
            <div className='dropdown-divider'></div>
            <DropdownItem onClick={() => router.push('/ContactUs')}>
              <i className='mdi mdi-email-fast text-muted fs-16 align-middle me-1'></i>
              <span className='align-middle'>Contact Us</span>
            </DropdownItem>
            <DropdownItem onClick={() => signOut()}>
              <i className='mdi mdi-logout text-muted fs-16 align-middle me-1'></i>{' '}
              <span className='align-middle' data-key='t-logout'>
                Logout
              </span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Link href={'/api/auth/signin'}>
          <h5 className='fs-5 fw-semibold text-primary' style={{ cursor: 'pointer' }}>
            Sign In
          </h5>
        </Link>
      )}
    </React.Fragment>
  )
}

export default ProfileDropdown
