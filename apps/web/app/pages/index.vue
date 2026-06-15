<template>
  <div class="max-w-4xl mx-auto py-8">
    <OnboardingModal />
    
    <div class="text-center mb-12">
      <h2 class="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {{ $t('home.title') }}
      </h2>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        {{ $t('home.subtitle') }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Games list -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary transition-colors group cursor-pointer" @click="navigateTo('/games/rummy')">
        <div class="flex justify-between items-start mb-4">
          <div class="text-4xl">🃏</div>
          <span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">{{ $t('home.popular') }}</span>
        </div>
        <h3 class="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{{ $t('home.rummy_title') }}</h3>
        <p class="text-gray-400 mb-4">
          {{ $t('home.rummy_desc') }}
        </p>
        <button class="bg-gray-700 hover:bg-primary w-full py-2 rounded-lg font-medium transition-colors">
          {{ $t('home.play_rummy') }}
        </button>
      </div>
      
      <!-- Leaderboard preview -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
            <span>🏆</span> {{ $t('home.top_players') }}
          </h3>
          
          <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="animate-pulse flex items-center justify-between bg-gray-900 p-3 rounded-lg">
              <div class="h-4 bg-gray-700 rounded w-24"></div>
              <div class="h-4 bg-gray-700 rounded w-12"></div>
            </div>
          </div>
          
          <div v-else-if="topPlayers.length === 0" class="text-gray-500 text-center py-6">
            {{ $t('leaderboard.no_players') }}
          </div>

          <div v-else class="space-y-3">
            <div v-for="player in topPlayers" :key="player.playerId" class="flex items-center justify-between bg-gray-900 p-3 rounded-lg hover:bg-gray-850 transition-colors cursor-pointer" @click="navigateTo(`/profile/${player.playerId}`)">
              <div class="flex items-center gap-3">
                <span class="text-lg font-bold w-6" :class="getMedalColor(player.rank)">#{{ player.rank }}</span>
                <span class="text-base">{{ player.avatarUrl || '👤' }}</span>
                <span class="font-medium truncate max-w-40">{{ player.username }}</span>
              </div>
              <span class="text-primary font-bold">{{ player.totalPoints }} {{ $t('home.pts') }}</span>
            </div>
          </div>
        </div>

        <button class="w-full text-center text-sm text-gray-400 hover:text-white mt-4 pt-4 border-t border-gray-700/50 transition-colors" @click="navigateTo('/leaderboard')">
          {{ $t('home.view_leaderboard') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { fetchApi } = useApi()
const topPlayers = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    topPlayers.value = await fetchApi('/players/leaderboard?limit=3')
  } catch (err) {
    console.error('Failed to fetch leaderboard preview:', err)
  } finally {
    loading.value = false
  }
})

const getMedalColor = (rank: number) => {
  switch(rank) {
    case 1: return 'text-yellow-400'
    case 2: return 'text-gray-300'
    case 3: return 'text-amber-600'
    default: return 'text-gray-500'
  }
}
</script>
