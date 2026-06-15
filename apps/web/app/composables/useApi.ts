export const useApi = () => {
  const config = useRuntimeConfig()
  const token = useCookie('kirenina-token')

  const fetchApi = async <T = any>(path: string, options: Parameters<typeof $fetch>[1] = {}) => {
    const headers = {
      ...(options.headers || {}),
    } as Record<string, string>

    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${path}`, {
        ...options,
        headers,
      })
    } catch (err: any) {
      console.error(`API Error on ${path}:`, err.data || err)
      throw err
    }
  }

  return {
    fetchApi,
    token,
  }
}
