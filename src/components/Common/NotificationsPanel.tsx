import Link from 'next/link'
import { useContext } from 'react'

import { useSession } from '@auth/client'
import { notificationsTagLinks } from '@components/constants/notifications'
import AppContext from '@context/AppContext'
import { useSocket } from '@hooks/useSocket'
import { NotificationsPanelResponse } from '@typesTs/notifications'
import axios from 'axios'
import moment from 'moment'
import { toast } from 'react-toastify'
import { Button, ButtonGroup, DropdownMenu, DropdownToggle, UncontrolledDropdown } from '@/components/migration-ui'
import useSWR from 'swr'

const fetcher = async (endPoint: string) => await axios.get<NotificationsPanelResponse>(endPoint).then((res) => res.data.notifications)

const NotificationsPanel = () => {
  const { data: session } = useSession() // ✅ Get user session from NextAuth
  const userId = session?.user?.businessId ?? null // ✅ Get userId or set to null

  const { state }: any = useContext(AppContext)

  const { data: notifications, mutate } = useSWR(
    state.user.businessId ? `/api/notifications/getNotifications?region=${state.currentRegion}&businessId=${state.user.businessId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 1000 * 60 * 5,
    }
  )

  useSocket(userId, mutate) // ✅ Pass userId to useSocket

  if (!session) return null // ✅ Hide panel if user is not logged in

  const markNotificationsAsRead = async () => {
    const markNotificationsAsRead = toast.loading('Marking Notifications as Read...')
    try {
      const { data } = await axios.post(`/api/notifications/markNotificationsAsRead?region=${state.currentRegion}&businessId=${state.user.businessId}`)
      if (!data.error) {
        toast.update(markNotificationsAsRead, {
          render: data.message,
          type: 'success',
          isLoading: false,
          autoClose: 3000,
        })
        mutate()
      } else {
        toast.update(markNotificationsAsRead, {
          render: data.message,
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        })
      }
    } catch (error) {
      toast.update(markNotificationsAsRead, {
        render: 'Error marking notifications as read',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      })
    }
  }
  return (
    <div className='notification-panel'>
      <ButtonGroup>
        <UncontrolledDropdown className='dropdown tw:inline-block' direction='down'>
          <DropdownToggle tag='button' className='btn btn-primary btn-icon'>
            <i className='mdi mdi-bell fs-4' />
            {notifications?.some((info) => !info.read) && (
              <span className='badge bg-danger position-absolute top-0 start-100 translate-middle'>{notifications?.filter((info) => !info.read).length}</span>
            )}
          </DropdownToggle>
          <DropdownMenu className='dropdown-menu-lg tw:pt-0 tw:mt-2' end style={{ minWidth: '200px' }}>
            <div className='bg-primary bg-pattern tw:rounded-t tw:flex tw:flex-col tw:justify-between tw:items-baseline tw:md:flex-row'>
              <h6 className='tw:font-semibold tw:text-white tw:text-left tw:p-4 tw:text-[16.25px]'>Notifications</h6>
              {notifications && notifications?.length > 0 && (
                <Button color='ghost' className='tw:text-white tw:text-[11.2px]' size='sm' onClick={markNotificationsAsRead}>
                  Mark as Read
                </Button>
              )}
            </div>
            {notifications && notifications?.length > 0 ? (
              <div className='tw:flex tw:flex-col tw:gap-2 tw:items-start tw:w-full tw:overflow-auto tw:px-4 tw:py-2'>
                {notifications.map((info, index) => (
                  <div key={info.id} className={`tw:w-full tw:pb-1 ${index !== notifications.length - 1 ? 'tw:border-b tw:border-[color:var(--border)]' : ''}`}>
                    <p className='tw:m-0 tw:mb-1 tw:text-[11.2px] tw:font-semibold tw:flex tw:flex-row tw:justify-between tw:items-center'>
                      {info.title}
                      {!info.read && <i className='text-danger mdi mdi-alert-circle fs-6 me-1' />}
                    </p>
                    <p className='tw:m-0 tw:text-[var(--bs-secondary-color)] tw:font-normal tw:truncate' style={{ fontSize: '0.65rem' }}>
                      {info.description}
                    </p>
                    <span className='tw:m-0 tw:font-normal tw:justify-start tw:items-end tw:gap-1 tw:lg:flex tw:lg:flex-row' style={{ fontSize: '0.65rem' }}>
                      {moment(info.created).fromNow()}
                      {info.tag && notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks]?.link && (
                        <Link href={notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks].link} className='tw:capitalize tw:!text-primary tw:flex tw:items-end tw:gap-1'>
                          {' • '}
                          {notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks].title} <i className='ri-external-link-fill m-0 fs-7 text-primary' />
                        </Link>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='tw:flex tw:flex-col tw:gap-2 tw:items-start tw:w-full tw:overflow-auto tw:px-4 tw:py-2'>
                <div className='tw:w-full tw:py-2'>
                  <p className='tw:m-0 tw:text-[11.2px] tw:font-normal tw:text-[var(--bs-secondary-color)]'>Notifications will appear here</p>
                </div>
              </div>
            )}
          </DropdownMenu>
        </UncontrolledDropdown>
      </ButtonGroup>
    </div>
  )
}

export default NotificationsPanel
