import Link from 'next/link'
import { useContext } from 'react'

import { useSession } from '@auth/client'
import { notificationsTagLinks } from '@components/constants/notifications'
import AppContext from '@context/AppContext'
import { useSocket } from '@hooks/useSocket'
import { NotificationsPanelResponse } from '@typesTs/notifications'
import axios from 'axios'
import moment from 'moment'
import { toast } from '@/lib/toast'
import { Button, buttonVariants } from '@shadcn/ui/button'
import { badgeVariants } from '@shadcn/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@shadcn/ui/dropdown-menu'
import { cn } from '@/lib/shadcn/utils'
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
      <div role='group' className='inline-flex'>
        <DropdownMenu>
          <div className='dropdown inline-block'>
            <DropdownMenuTrigger asChild>
              <button type='button' className={cn(buttonVariants(), 'btn-icon')}>
                <i className='mdi mdi-bell text-[19.5px]' />
                {notifications?.some((info) => !info.read) && (
                  <span className={cn(badgeVariants({ variant: 'destructive' }), 'rounded-sm absolute top-0 left-full -translate-x-1/2 -translate-y-1/2')}>{notifications?.filter((info) => !info.read).length}</span>
                )}
              </button>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent align='end' className='dropdown-menu-lg pt-0 mt-2' style={{ minWidth: '200px' }}>
            <div className='bg-primary bg-pattern rounded-t flex flex-col justify-between items-baseline md:flex-row'>
              <h6 className='font-semibold text-white text-left p-4 text-[16.25px]'>Notifications</h6>
              {notifications && notifications?.length > 0 && (
                <Button variant='ghost' className='text-white text-[11.2px]' size='sm' onClick={markNotificationsAsRead}>
                  Mark as Read
                </Button>
              )}
            </div>
            {notifications && notifications?.length > 0 ? (
              <div className='flex flex-col gap-2 items-start w-full overflow-auto px-4 py-2'>
                {notifications.map((info, index) => (
                  <div key={info.id} className={`w-full pb-1 ${index !== notifications.length - 1 ? 'border-b border-[color:var(--border)]' : ''}`}>
                    <p className='m-0 mb-1 text-[11.2px] font-semibold flex flex-row justify-between items-center'>
                      {info.title}
                      {!info.read && <i className='text-destructive mdi mdi-alert-circle text-[13px] me-1' />}
                    </p>
                    <p className='m-0 text-muted-foreground font-normal truncate' style={{ fontSize: '0.65rem' }}>
                      {info.description}
                    </p>
                    <span className='m-0 font-normal justify-start items-end gap-1 lg:flex lg:flex-row' style={{ fontSize: '0.65rem' }}>
                      {moment(info.created).fromNow()}
                      {info.tag && notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks]?.link && (
                        <Link href={notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks].link} className='capitalize !text-primary flex items-end gap-1'>
                          {' • '}
                          {notificationsTagLinks[info.tag as keyof typeof notificationsTagLinks].title} <i className='ri-external-link-fill m-0 text-[11.2px] text-primary' />
                        </Link>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className='flex flex-col gap-2 items-start w-full overflow-auto px-4 py-2'>
                <div className='w-full py-2'>
                  <p className='m-0 text-[11.2px] font-normal text-muted-foreground'>Notifications will appear here</p>
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export default NotificationsPanel
