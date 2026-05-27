import { defineConfig, presetUno, presetWebFonts, presetIcons } from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      scale: 1.2,
    }),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: 'Inter:400,500,600,700',
        display: 'Outfit:400,600,700',
      },
    }),
  ],
  theme: {
    colors: {
      primary: '#10b981', // Emerald 500
      secondary: '#6366f1', // Indigo 500
      dark: '#111827',
      light: '#f9fafb'
    }
  }
})
