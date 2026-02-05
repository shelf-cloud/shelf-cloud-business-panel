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
import { Button, ButtonGroup, DropdownMenu, DropdownToggle, UncontrolledDropdown } from 'reactstrap'
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
        <UncontrolledDropdown className='dropdown d-inline-block' direction='down'>
          <DropdownToggle tag='button' className='btn btn-primary btn-icon'>
            <i className='mdi mdi-bell fs-4' />
            {notifications?.some((info) => !info.read) && (
              <span className='badge bg-danger position-absolute top-0 start-100 translate-middle'>{notifications?.filter((info) => !info.read).length}</span>
            )}
          </DropdownToggle>
          <DropdownMenu className='dropdown-menu-lg pt-0 mt-2' end style={{ minWidth: '200px' }}>
            <div className='bg-primary bg-pattern rounded-top d-flex flex-column justify-content-between align-items-baseline flex-md-row'>
              <h6 className='fw-semibold text-white text-left p-3 fs-5'>Notifications</h6>
              {notifications && notifications?.length > 0 && (
                <Button color='ghost' className='text-white fs-7' size='sm' onClick={markNotificationsAsRead}>
                  Mark as Read
                </Button>
              )}
            </div>
            {notifications && notifications?.length > 0 ? (
              <div className='d-flex flex-column gap-2 align-items-start w-100 overflow-auto px-3 py-2'>
                {notifications.map((info, index) => (
                  <div key={info.id} className={`w-100 pb-1 ${index !== notifications.length - 1 ? 'border-bottom' : ''}`}>
                    <p className='m-0 mb-1 fs-7 fw-semibold d-flex flex-row justify-content-between align-items-center'>
                      {info.title}
                      {!info.read && <i className='text-danger mdi mdi-alert-circle fs-6 me-1' />}
                    </p>
                    <p className='m-0 text-muted fw-normal text-truncate' style={{ fontSize: '0.65rem' }}>
                      {info.description}
                    </p>
                    <span className='m-0 fw-normal d-column justify-content-start align-items-end gap-1 d-lg-flex' style={{ fontSize: '0.65rem' }}>
                      {moment(info.created).fromNow()}
                      {info.tag && notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks]?.link && (
                        <Link href={notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks].link} className='capitalize text-primary d-flex align-items-end gap-1'>
                          {' • '}
                          {notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks].title} <i className='ri-external-link-fill m-0 fs-7 text-primary' />
                        </Link>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='d-flex flex-column gap-2 align-items-start w-100 overflow-auto px-3 py-2'>
                <div className='w-100 py-2'>
                  <p className='m-0 fs-7 fw-normal text-muted'>Notifications will appear here</p>
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
