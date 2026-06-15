import fpPromise from '@fingerprintjs/fingerprintjs'

export interface Player {
  id: string
  deviceId: string
  username: string
  avatarUrl: string | null
  isPublic: boolean
  totalPoints: number
  gamesPlayed: number
  gamesWon: number
  medal: 'NONE' | 'BRONZE' | 'SILVER' | 'GOLD'
  winRate: number
  createdAt: string
  updatedAt: string
}

export const useAuth = () => {
  const { fetchApi, token } = useApi()
  const isInitialized = useState('auth-init', () => false)
  const user = useState<Player | null>('auth-user', () => null)

  const initAuth = async (username: string) => {
    const fp = await fpPromise.load()
    const result = await fp.get()
    const deviceId = result.visitorId

    try {
      const response = await fetchApi<{ player: Player; token: string }>('/auth/login', {
        method: 'POST',
        body: { deviceId, username }
      })

      // Enregistrer le token dans un cookie de 30 jours
      const tokenCookie = useCookie('kirenina-token', { maxAge: 30 * 24 * 60 * 60 })
      tokenCookie.value = response.token

      user.value = response.player
      isInitialized.value = true
      return response.player
    } catch (error: any) {
      console.error('Erreur authentification:', error)
      throw error
    }
  }

  const checkAuth = async () => {
    const tokenCookie = useCookie('kirenina-token')
    if (!tokenCookie.value) {
      isInitialized.value = false
      user.value = null
      return false
    }

    try {
      const player = await fetchApi<Player>('/players/me')
      user.value = player
      isInitialized.value = true
      return true
    } catch (error) {
      console.error('Erreur validation token:', error)
      // Token invalide ou expiré, on nettoie
      tokenCookie.value = null
      user.value = null
      isInitialized.value = false
      return false
    }
  }

  const updateProfile = async (data: { username?: string; avatarUrl?: string | null; isPublic?: boolean }) => {
    try {
      const updatedPlayer = await fetchApi<Player>('/players/me', {
        method: 'PATCH',
        body: data
      })
      user.value = updatedPlayer
      return updatedPlayer
    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      throw error
    }
  }

  const logout = () => {
    const tokenCookie = useCookie('kirenina-token')
    tokenCookie.value = null
    user.value = null
    isInitialized.value = false
  }

  return {
    isInitialized,
    user,
    initAuth,
    checkAuth,
    updateProfile,
    logout
  }
}
