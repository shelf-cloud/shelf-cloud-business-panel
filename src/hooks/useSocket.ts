/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'

import { ToastNotificationUserBody } from '@typesTs/notifications'
import { toast } from 'react-toastify'
import { Socket, io } from 'socket.io-client'

let socket: Socket | null = null // Global socket instance

export const useSocket = (userId: string | null, mutate: () => void) => {
  useEffect(() => {
    if (!userId) return // ✅ Only connect when the user is logged in

    const panelUserId = `panel_${userId}` // ✅ Create unique user ID for panel

    const socketUrl = process.env.NEXT_PUBLIC_WS_SHELFCLOUD_SERVER_URL

    // ✅ Create WebSocket connection
    socket = io(socketUrl, {
      query: { userId: panelUserId },
      transports: ['websocket', 'polling'], // ✅ Ensure compatible transport
      reconnectionAttempts: 5, // ✅ Try 5 times before failing
      reconnectionDelay: 3000, // ✅ Wait 3s before retrying
    })

    // ✅ Register user in room
    socket.emit('register', panelUserId)

    // ✅ Listen for notifications
    socket.on('notification', (data: ToastNotificationUserBody) => {
      if (data.needToast) showToastByType(data)
      mutate()
      //   setNotifications((prev) => [...prev, data.message])
    })

    return () => {
      if (socket) {
        socket.disconnect() // ✅ Disconnect socket when user logs out
        socket = null
      }
    }
  }, [userId])
}

const showToastByType = (data: ToastNotificationUserBody) => {
  switch (data.type) {
    case 'success':
      toast.success(data.title)
      break
    case 'error':
      toast.error(data.title)
      break
    case 'warning':
      toast.warning(data.title)
      break
    case 'info':
      toast.info(data.title)
      break
    default:
      toast.info(data.title)
      break
  }
}
