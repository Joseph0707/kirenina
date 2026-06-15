import { type Ref } from 'vue'

export interface I18nContext {
  t: (key: string, options?: any) => string
  locale: Ref<string>
  setLocale: (lang: string) => void
}

export const useI18n = (): I18nContext => {
  const { $i18n } = useNuxtApp()
  return $i18n as I18nContext
}
