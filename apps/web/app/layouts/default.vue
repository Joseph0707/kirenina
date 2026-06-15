<template>
  <div class="min-h-screen flex flex-col bg-dark text-light font-sans">
    <header class="p-4 border-b border-gray-800 flex justify-between items-center max-w-7xl w-full mx-auto">
      <NuxtLink to="/" class="text-2xl font-display font-bold text-primary tracking-wide hover:opacity-90 transition-opacity">
        Kirenina
      </NuxtLink>
      <div class="flex items-center gap-6">
        <nav class="flex gap-4 items-center">
          <NuxtLink to="/" class="hover:text-primary transition-colors text-sm font-medium">{{ t('nav.home') }}</NuxtLink>
          <NuxtLink to="/leaderboard" class="hover:text-primary transition-colors text-sm font-medium">{{ t('nav.leaderboard') }}</NuxtLink>
          <NuxtLink to="/games/rummy" class="hover:text-primary transition-colors text-sm font-medium">{{ t('nav.rummy') }}</NuxtLink>
        </nav>
        
        <div class="h-4 w-[1px] bg-gray-800"></div>

        <!-- Sélecteur de Langue -->
        <div class="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-0.5">
          <button 
            @click="setLocale('fr')" 
            class="text-[10px] font-bold px-2 py-1 rounded transition-all"
            :class="locale === 'fr' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-light'"
          >
            FR
          </button>
          <button 
            @click="setLocale('en')" 
            class="text-[10px] font-bold px-2 py-1 rounded transition-all"
            :class="locale === 'en' ? 'bg-primary text-white shadow-sm' : 'text-gray-400 hover:text-light'"
          >
            EN
          </button>
        </div>

        <!-- Profil Utilisateur -->
        <div v-if="user" class="flex items-center gap-3">
          <NuxtLink to="/profile" class="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-all text-sm font-medium">
            <span class="text-base">{{ user.avatarUrl || '👤' }}</span>
            <span class="max-w-[120px] truncate">{{ user.username }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>
    
    <main class="flex-1 max-w-7xl w-full mx-auto p-4">
      <slot />
    </main>
    
    <footer class="p-6 border-t border-gray-800 text-center text-xs text-gray-500 max-w-7xl w-full mx-auto">
      &copy; {{ new Date().getFullYear() }} Kirenina. {{ t('footer.rights') }}
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '~/composables/useI18n'
const { t, locale, setLocale } = useI18n()
const { user } = useAuth()
</script>
