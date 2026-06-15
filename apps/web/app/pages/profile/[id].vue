<template>
  <div class="max-w-4xl mx-auto py-8">
    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p class="text-gray-400">Chargement du profil...</p>
    </div>

    <!-- Error State: Not Found / Private Profile -->
    <div v-else-if="notFound" class="max-w-md mx-auto bg-gray-800 border border-gray-700 rounded-xl p-8 text-center shadow-2xl">
      <div class="text-6xl mb-4">🔒</div>
      <h2 class="text-2xl font-bold mb-2 text-white">{{ t('public_profile.not_found_title') }}</h2>
      <p class="text-gray-400 mb-6">{{ t('public_profile.not_found_desc') }}</p>
      <button class="bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg transition-colors w-full" @click="navigateTo('/')">
        {{ t('public_profile.back_home') }}
      </button>
    </div>

    <!-- Success State: Public Profile Details -->
    <div v-else-if="player" class="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
      <!-- Left Column: Identity card -->
      <div class="md:col-span-1 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl text-center h-fit">
        <div class="flex justify-center mb-4">
          <div class="text-6xl p-4 bg-gray-900 border-2 border-gray-700 rounded-full w-24 h-24 flex items-center justify-center shadow-inner select-none">
            {{ player.avatarUrl || '👤' }}
          </div>
        </div>
        
        <h2 class="text-2xl font-display font-bold text-white mb-1 truncate max-w-full">
          {{ player.username }}
        </h2>
        
        <div class="inline-flex items-center gap-1.5 bg-gray-900 px-3 py-1 rounded-full text-xs text-gray-400 border border-gray-750 mb-6">
          <span>📅</span> {{ t('public_profile.member_since') }} {{ formatDate(player.createdAt) }}
        </div>

        <div class="flex justify-center items-center gap-2 bg-primary/10 border border-primary/20 p-3 rounded-lg">
          <span class="text-2xl">{{ getMedalEmoji(player.medal) }}</span>
          <span class="font-bold text-primary">{{ t(`profile.medals.${player.medal}`) }}</span>
        </div>
      </div>

      <!-- Right Column: Stats Grid -->
      <div class="md:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
        <h2 class="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
          <span>📊</span> {{ t('profile.stats_title') }}
        </h2>

        <div class="grid grid-cols-2 gap-4">
          <!-- Points Card -->
          <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750">
            <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ t('profile.points') }}</span>
            <div class="text-3xl font-extrabold text-primary mt-1">{{ player.totalPoints }}</div>
          </div>

          <!-- Win Rate Card -->
          <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750 flex items-center justify-between">
            <div>
              <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ t('profile.win_rate') }}</span>
              <div class="text-3xl font-extrabold text-secondary mt-1">{{ player.winRate }}%</div>
            </div>
            <div class="relative h-12 w-12 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="24" cy="24" r="20" stroke="currentColor" class="text-gray-800" stroke-width="4" fill="transparent" />
                <circle cx="24" cy="24" r="20" stroke="currentColor" class="text-secondary" stroke-width="4" fill="transparent"
                  :stroke-dasharray="2 * Math.PI * 20"
                  :stroke-dashoffset="2 * Math.PI * 20 * (1 - player.winRate / 100)"
                />
              </svg>
            </div>
          </div>

          <!-- Games Played Card -->
          <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750">
            <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ t('profile.games_played') }}</span>
            <div class="text-3xl font-extrabold text-white mt-1">{{ player.gamesPlayed }}</div>
          </div>

          <!-- Games Won Card -->
          <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750">
            <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ t('profile.games_won') }}</span>
            <div class="text-3xl font-extrabold text-white mt-1">{{ player.gamesWon }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const route = useRoute()
const { fetchApi } = useApi()
const { t } = useI18n()

const player = ref<any | null>(null)
const loading = ref(true)
const notFound = ref(false)

onMounted(async () => {
  try {
    player.value = await fetchApi(`/players/${route.params.id}`)
  } catch (err) {
    console.error('Failed to load public profile:', err)
    notFound.value = true
  } finally {
    loading.value = false
  }
})

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const getMedalEmoji = (medal: string) => {
  switch (medal) {
    case 'GOLD': return '🥇'
    case 'SILVER': return '🥈'
    case 'BRONZE': return '🥉'
    default: return '🎖️'
  }
}
</script>
