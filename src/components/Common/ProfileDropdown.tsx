 
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import flag_of_SC from '@assets/images/avatar-shelfcloud.png'
import flag_of_europe from '@assets/images/flag_of_europe.png'
import flag_of_usa from '@assets/images/flag_of_usa.png'
import { signOut, useSession } from '@auth/client'
import AppContext from '@context/AppContext'
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from '@/components/migration-ui'

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
      {session?.user?.businessName ? (
        <Dropdown
          isOpen={isProfileDropdown}
          toggle={toggleProfileDropdown}
          className='tw:flex tw:items-center tw:rounded-[1rem] tw:shadow-sm'
          style={{ backgroundColor: 'rgba(239, 243, 246, 1)' }}>
          <DropdownToggle tag='button' type='button' className='btn'>
            <span className='tw:flex tw:items-center tw:justify-between tw:gap-2'>
              <span className='tw:text-right tw:flex tw:flex-col'>
                <span className='tw:inline-block tw:text-[13px] tw:m-0 tw:font-medium user-name-text tw:capitalize'>{session?.user?.businessName}</span>
                <span className='tw:inline-block tw:text-[11.2px] tw:m-0 tw:text-[var(--bs-secondary-color)] user-name-sub-text'>{state.currentRegion !== '' && (state.currentRegion == 'us' ? 'USA' : 'EUROPE')}</span>
              </span>
              {state &&
                state.currentRegion !== '' &&
                (state.currentRegion == 'us' ? (
                  <Image
                    className='tw:rounded-full header-profile-user'
                    src={flag_of_usa}
                    width={25}
                    height={25}
                    alt='Header Avatar'
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                ) : state.currentRegion == 'eu' ? (
                  <Image
                    className='tw:rounded-full header-profile-user'
                    src={flag_of_europe}
                    width={25}
                    height={25}
                    alt='Header Avatar'
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                ) : (
                  <Image
                    className='tw:rounded-full header-profile-user'
                    src={flag_of_SC}
                    width={25}
                    height={25}
                    alt='Header Avatar'
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                    }}
                  />
                ))}
            </span>
          </DropdownToggle>
          <DropdownMenu className='dropdown-menu-end' container={'body'} end>
            <h6 className='dropdown-header tw:capitalize'>Welcome {session?.user?.profileName}</h6>
            {session?.user?.role === 'admin' && (
              <DropdownItem onClick={() => router.push('/Profile')}>
                <i className='mdi mdi-account-circle text-muted fs-16 align-middle me-1'></i>
                <span className='tw:align-middle'>Profile</span>
              </DropdownItem>
            )}
            {session?.user?.role === 'admin' && (
              <DropdownItem onClick={() => router.push('/settings/teamMembers')}>
                <i className='ri-team-fill text-muted fs-16 align-middle me-1'></i>
                <span className='tw:align-middle'>Team Members</span>
              </DropdownItem>
            )}
            {session?.user?.role === 'admin' && (
              <DropdownItem onClick={() => router.push('/Settings')}>
                <i className='mdi mdi-tools text-muted fs-16 align-middle me-1'></i>
                <span className='tw:align-middle'>Account Settings</span>
              </DropdownItem>
            )}
            {session?.user?.role === 'admin' && (
              <DropdownItem onClick={() => router.push('/marketplaceManager')}>
                <i className='mdi mdi-store text-muted fs-16 align-middle me-1'></i>
                <span className='tw:align-middle'>Marketplace Manager</span>
              </DropdownItem>
            )}
            {state.user.hasShelfCloudEu == true && state.user.hasShelfCloudUsa == true && (
              <DropdownItem className='tw:flex tw:justify-start tw:items-center' onClick={state.currentRegion == 'us' ? () => setRegion('eu') : () => setRegion('us')}>
                <div className='tw:align-middle tw:me-1' style={{ width: '15px', height: '15px' }}>
                  {state.currentRegion == 'eu' ? (
                    <Image
                      className='tw:rounded-full header-profile-user'
                      src={flag_of_usa}
                      width={16}
                      height={16}
                      alt='Header Avatar'
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                    />
                  ) : (
                    <Image
                      className='tw:rounded-full header-profile-user'
                      src={flag_of_europe}
                      width={16}
                      height={16}
                      alt='Header Avatar'
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                      }}
                    />
                  )}
                </div>
                <div className='tw:align-middle'>Change Location</div>
              </DropdownItem>
            )}
            <div className='dropdown-divider'></div>
            <DropdownItem onClick={() => router.push('/ContactUs')}>
              <i className='mdi mdi-email-fast text-muted fs-16 align-middle me-1'></i>
              <span className='tw:align-middle'>Contact Us</span>
            </DropdownItem>
            <DropdownItem onClick={() => signOut()}>
              <i className='mdi mdi-logout text-muted fs-16 align-middle me-1'></i>{' '}
              <span className='tw:align-middle' data-key='t-logout'>
                Logout
              </span>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      ) : (
        <Link href={'/api/auth/signin'}>
          <h5 className='tw:text-[16.25px] tw:font-semibold tw:text-primary' style={{ cursor: 'pointer' }}>
            Sign In
          </h5>
        </Link>
      )}
    </React.Fragment>
  )
}

export default ProfileDropdown
