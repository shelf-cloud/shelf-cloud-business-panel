 
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useContext, useState } from 'react'

import flag_of_SC from '@assets/images/avatar-shelfcloud.png'
import flag_of_europe from '@assets/images/flag_of_europe.png'
import flag_of_usa from '@assets/images/flag_of_usa.png'
import { signOut, useSession } from '@auth/client'
import AppContext from '@context/AppContext'
import { DropdownMenu as DropdownMenuRoot, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'

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
        <DropdownMenuRoot
          open={isProfileDropdown}
          onOpenChange={(open) => {
            if (open !== isProfileDropdown) toggleProfileDropdown()
          }}>
          <div className='relative inline-block flex items-center rounded-[1rem] shadow-sm' style={{ backgroundColor: 'rgba(239, 243, 246, 1)' }}>
          <DropdownMenuTrigger asChild>
            <button type='button' className='btn'>
            <span className='flex items-center justify-between gap-2'>
              <span className='text-right flex flex-col'>
                <span className='inline-block text-[13px] m-0 font-medium user-name-text capitalize'>{session?.user?.businessName}</span>
                <span className='inline-block text-[11.2px] m-0 text-[var(--bs-secondary-color)] user-name-sub-text'>{state.currentRegion !== '' && (state.currentRegion == 'us' ? 'USA' : 'EUROPE')}</span>
              </span>
              {state &&
                state.currentRegion !== '' &&
                (state.currentRegion == 'us' ? (
                  <Image
                    className='rounded-full header-profile-user'
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
                    className='rounded-full header-profile-user'
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
                    className='rounded-full header-profile-user'
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
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='dropdown-menu-end'>
            <DropdownMenuLabel className='dropdown-header capitalize'>Welcome {session?.user?.profileName}</DropdownMenuLabel>
            {session?.user?.role === 'admin' && (
              <DropdownMenuItem onClick={() => router.push('/Profile')}>
                <i className='mdi mdi-account-circle text-[color:var(--bs-secondary-color)] fs-16 align-middle me-1'></i>
                <span className='align-middle'>Profile</span>
              </DropdownMenuItem>
            )}
            {session?.user?.role === 'admin' && (
              <DropdownMenuItem onClick={() => router.push('/settings/teamMembers')}>
                <i className='ri-team-fill text-[color:var(--bs-secondary-color)] fs-16 align-middle me-1'></i>
                <span className='align-middle'>Team Members</span>
              </DropdownMenuItem>
            )}
            {session?.user?.role === 'admin' && (
              <DropdownMenuItem onClick={() => router.push('/Settings')}>
                <i className='mdi mdi-tools text-[color:var(--bs-secondary-color)] fs-16 align-middle me-1'></i>
                <span className='align-middle'>Account Settings</span>
              </DropdownMenuItem>
            )}
            {session?.user?.role === 'admin' && (
              <DropdownMenuItem onClick={() => router.push('/marketplaceManager')}>
                <i className='mdi mdi-store text-[color:var(--bs-secondary-color)] fs-16 align-middle me-1'></i>
                <span className='align-middle'>Marketplace Manager</span>
              </DropdownMenuItem>
            )}
            {state.user.hasShelfCloudEu == true && state.user.hasShelfCloudUsa == true && (
              <DropdownMenuItem className='flex justify-start items-center' onClick={state.currentRegion == 'us' ? () => setRegion('eu') : () => setRegion('us')}>
                <div className='align-middle me-1' style={{ width: '15px', height: '15px' }}>
                  {state.currentRegion == 'eu' ? (
                    <Image
                      className='rounded-full header-profile-user'
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
                      className='rounded-full header-profile-user'
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
                <div className='align-middle'>Change Location</div>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/ContactUs')}>
              <i className='mdi mdi-email-fast text-[color:var(--bs-secondary-color)] fs-16 align-middle me-1'></i>
              <span className='align-middle'>Contact Us</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => signOut()}>
              <i className='mdi mdi-logout text-[color:var(--bs-secondary-color)] fs-16 align-middle me-1'></i>{' '}
              <span className='align-middle' data-key='t-logout'>
                Logout
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
          </div>
        </DropdownMenuRoot>
      ) : (
        <Link href={'/api/auth/signin'}>
          <h5 className='text-[16.25px] font-semibold text-primary' style={{ cursor: 'pointer' }}>
            Sign In
          </h5>
        </Link>
      )}
    </React.Fragment>
  )
}

export default ProfileDropdown
