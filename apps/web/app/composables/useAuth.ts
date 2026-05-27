import fpPromise from '@fingerprintjs/fingerprintjs'

export const useAuth = () => {
  const isInitialized = useState('auth-init', () => false)
  const user = useState<{ username: string; deviceId: string } | null>('auth-user', () => null)

  const initAuth = async (username: string) => {
    const fp = await fpPromise.load()
    const result = await fp.get()
    const deviceId = result.visitorId
    
    // TODO: Appel API pour register / identify
    user.value = { username, deviceId }
    isInitialized.value = true
    
    if (process.client) {
      localStorage.setItem('kirenina-user', JSON.stringify(user.value))
    }
  }

  const checkAuth = async () => {
    if (process.client) {
      const stored = localStorage.getItem('kirenina-user')
      if (stored) {
        user.value = JSON.parse(stored)
        isInitialized.value = true
        return true
      }
    }
    return false
  }

  return {
    isInitialized,
    user,
    initAuth,
    checkAuth
  }
}
