import { shallowRef } from 'vue'
import { io, type Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '@kirenina/shared-types'

const socketRef = shallowRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

export const useSocket = () => {
  const config = useRuntimeConfig()
  const isConnected = useState('socket-connected', () => false)
  const error = useState<string | null>('socket-error', () => null)

  const connect = () => {
    if (socketRef.value) {
      if (!socketRef.value.connected) {
        socketRef.value.connect()
      }
      return socketRef.value
    }

    const tokenCookie = useCookie('kirenina-token')
    const token = tokenCookie.value

    if (!token) {
      error.value = 'Missing authentication token'
      return null
    }

    const socketUrl = config.public.apiBase

    const instance = io(socketUrl, {
      auth: {
        token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    }) as unknown as Socket<ServerToClientEvents, ClientToServerEvents>

    instance.on('connect', () => {
      isConnected.value = true
      error.value = null
    })

    instance.on('disconnect', () => {
      isConnected.value = false
    })

    instance.on('connect_error', (err) => {
      console.error('Socket connection error:', err)
      isConnected.value = false
      error.value = err.message
    })

    socketRef.value = instance
    return instance
  }

  const disconnect = () => {
    if (socketRef.value) {
      socketRef.value.disconnect()
      socketRef.value = null
    }
    isConnected.value = false
  }

  return {
    socket: socketRef,
    isConnected,
    error,
    connect,
    disconnect
  }
}
