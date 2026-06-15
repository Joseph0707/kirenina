import i18next from 'i18next'
import fr from '../locales/fr.json'
import en from '../locales/en.json'

export default defineNuxtPlugin(async () => {
  const localeCookie = useCookie('kirenina-lang', { maxAge: 365 * 24 * 60 * 60 })
  const initialLang = localeCookie.value || 'fr'

  if (!i18next.isInitialized) {
    await i18next.init({
      lng: initialLang,
      fallbackLng: 'fr',
      resources: {
        fr: { translation: fr },
        en: { translation: en }
      },
      interpolation: {
        escapeValue: false, // Vue automatically escapes HTML
        prefix: '{',
        suffix: '}'
      }
    })
  }

  const locale = ref(i18next.language)

  // Synchronize the locale variable with i18next and the cookie
  watch(locale, async (newLang) => {
    if (i18next.language !== newLang) {
      await i18next.changeLanguage(newLang)
    }
    localeCookie.value = newLang
  })

  return {
    provide: {
      i18n: {
        t: (key: string, options?: any) => {
          return i18next.t(key, options)
        },
        locale,
        setLocale: (newLang: string) => {
          locale.value = newLang
        }
      }
    }
  }
})
