<template>
  <div class="max-w-5xl mx-auto py-8">
    <!-- Header -->
    <div class="text-center mb-10">
      <h2 class="text-4xl font-display font-bold text-white mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        {{ t('leaderboard.title') }}
      </h2>
      <p class="text-gray-400 max-w-lg mx-auto">
        {{ t('leaderboard.subtitle') }}
      </p>
    </div>

    <div v-if="loading" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p class="text-gray-400">Chargement du classement...</p>
    </div>

    <div v-else class="space-y-8 animate-fade-in">
      <!-- Top 3 Olympic Podium (only when search is empty and players exist) -->
      <div v-if="!searchQuery && podium.length > 0" class="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end pt-10 pb-6">
        <!-- 2nd Place (Silver) -->
        <div v-if="podium[1]" class="bg-gray-800/80 border border-gray-700/80 rounded-xl p-5 text-center flex flex-col items-center order-1 h-[190px] justify-between relative group hover:border-gray-500 transition-all cursor-pointer" @click="navigateTo(`/profile/${podium[1].playerId}`)">
          <span class="absolute -top-6 text-4xl">🥈</span>
          <div class="text-5xl mt-2 select-none">{{ podium[1].avatarUrl || '👤' }}</div>
          <div class="font-bold text-white mt-2 truncate w-full px-1">{{ podium[1].username }}</div>
          <div class="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <span>🏆</span> {{ podium[1].gamesWon }} {{ t('leaderboard.games_won').toLowerCase() }}
          </div>
          <div class="bg-gray-700/50 text-gray-300 font-bold px-3 py-1 rounded-full text-sm mt-2">
            {{ podium[1].totalPoints }} pts
          </div>
        </div>

        <!-- 1st Place (Gold) -->
        <div v-if="podium[0]" class="bg-gray-800 border-2 border-yellow-500 rounded-xl p-6 text-center flex flex-col items-center order-2 h-[220px] justify-between relative shadow-2xl shadow-yellow-500/10 group hover:scale-105 transition-all cursor-pointer" @click="navigateTo(`/profile/${podium[0].playerId}`)">
          <span class="absolute -top-7 text-5xl animate-bounce">🥇</span>
          <div class="text-6xl mt-1 select-none">{{ podium[0].avatarUrl || '👤' }}</div>
          <div class="font-bold text-white text-lg mt-2 truncate w-full px-1">{{ podium[0].username }}</div>
          <div class="text-yellow-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
            <span>🔥</span> {{ podium[0].gamesWon }} {{ t('leaderboard.games_won').toLowerCase() }}
          </div>
          <div class="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 font-bold px-4 py-1.5 rounded-full text-base mt-2">
            {{ podium[0].totalPoints }} pts
          </div>
        </div>

        <!-- 3rd Place (Bronze) -->
        <div v-if="podium[2]" class="bg-gray-800/80 border border-gray-700/80 rounded-xl p-5 text-center flex flex-col items-center order-3 h-[170px] justify-between relative group hover:border-gray-500 transition-all cursor-pointer" @click="navigateTo(`/profile/${podium[2].playerId}`)">
          <span class="absolute -top-6 text-4xl">🥉</span>
          <div class="text-4xl mt-3 select-none">{{ podium[2].avatarUrl || '👤' }}</div>
          <div class="font-bold text-white mt-2 truncate w-full px-1">{{ podium[2].username }}</div>
          <div class="text-gray-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            <span>🏆</span> {{ podium[2].gamesWon }} {{ t('leaderboard.games_won').toLowerCase() }}
          </div>
          <div class="bg-gray-700/50 text-gray-300 font-bold px-3 py-1 rounded-full text-xs mt-2">
            {{ podium[2].totalPoints }} pts
          </div>
        </div>
      </div>

      <!-- Search Input -->
      <div class="max-w-md mx-auto">
        <div class="relative">
          <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            🔍
          </span>
          <input 
            type="text" 
            v-model="searchQuery"
            class="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-500 shadow-inner"
            :placeholder="t('leaderboard.search_placeholder')"
          />
        </div>
      </div>

      <!-- Leaderboard Table -->
      <div class="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-900 border-b border-gray-700 text-gray-400 text-xs uppercase font-bold tracking-wider select-none">
                <th class="py-4 px-6 text-center w-20">{{ t('leaderboard.rank') }}</th>
                <th class="py-4 px-6">{{ t('leaderboard.player') }}</th>
                <th class="py-4 px-6 text-center">{{ t('leaderboard.medal') }}</th>
                <th class="py-4 px-6 text-center w-36">{{ t('leaderboard.games_won') }}</th>
                <th class="py-4 px-6 text-right w-36">{{ t('leaderboard.points') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="p in filteredPlayers" 
                :key="p.playerId"
                @click="navigateTo(`/profile/${p.playerId}`)"
                class="border-b border-gray-800 hover:bg-gray-750 transition-colors cursor-pointer"
                :class="user && user.id === p.playerId ? 'bg-primary/5 border-l-4 border-l-primary' : ''"
              >
                <!-- Rank -->
                <td class="py-4 px-6 text-center font-extrabold text-base select-none">
                  <span v-if="p.rank === 1">🥇</span>
                  <span v-else-if="p.rank === 2">🥈</span>
                  <span v-else-if="p.rank === 3">🥉</span>
                  <span v-else class="text-gray-400">#{{ p.rank }}</span>
                </td>
                
                <!-- Nickname -->
                <td class="py-4 px-6 flex items-center gap-3">
                  <span class="text-2xl select-none">{{ p.avatarUrl || '👤' }}</span>
                  <span class="font-bold text-white hover:text-primary transition-colors">{{ p.username }}</span>
                  <span v-if="user && user.id === p.playerId" class="bg-primary/20 text-primary border border-primary/20 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase select-none">Moi</span>
                </td>

                <!-- Medal Category -->
                <td class="py-4 px-6 text-center font-bold text-sm">
                  <span v-if="p.medal !== 'NONE'" class="inline-flex items-center gap-1 bg-gray-900 border border-gray-700 px-2.5 py-1 rounded-full text-xs" :class="getMedalBadgeColor(p.medal)">
                    <span>{{ getMedalMiniEmoji(p.medal) }}</span>
                    <span>{{ t(`profile.medals.${p.medal}`) }}</span>
                  </span>
                  <span v-else class="text-gray-500 font-normal">-</span>
                </td>

                <!-- Games Won -->
                <td class="py-4 px-6 text-center font-semibold text-gray-300">
                  {{ p.gamesWon }}
                </td>

                <!-- Points -->
                <td class="py-4 px-6 text-right font-extrabold text-primary text-lg">
                  {{ p.totalPoints }} pts
                </td>
              </tr>

              <!-- Empty state inside table -->
              <tr v-if="filteredPlayers.length === 0">
                <td colspan="5" class="py-12 px-6 text-center text-gray-500 font-medium">
                  {{ t('leaderboard.no_players') }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { t } = useI18n()
const { fetchApi } = useApi()
const { user } = useAuth()

const players = ref<any[]>([])
const loading = ref(true)
const searchQuery = ref('')

onMounted(async () => {
  try {
    // On charge le top 50
    players.value = await fetchApi('/players/leaderboard?limit=50')
  } catch (err) {
    console.error('Failed to fetch leaderboard:', err)
  } finally {
    loading.value = false
  }
})

// Extract top 3 players for the visual podium
const podium = computed(() => {
  return players.value.slice(0, 3)
})

// Filter players by username locally
const filteredPlayers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return players.value
  return players.value.filter(p => p.username.toLowerCase().includes(query))
})

const getMedalMiniEmoji = (medal: string) => {
  switch (medal) {
    case 'GOLD': return '🥇'
    case 'SILVER': return '🥈'
    case 'BRONZE': return '🥉'
    default: return '🎖️'
  }
}

const getMedalBadgeColor = (medal: string) => {
  switch (medal) {
    case 'GOLD': return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
    case 'SILVER': return 'text-gray-300 border-gray-600/20 bg-gray-600/5'
    case 'BRONZE': return 'text-amber-500 border-amber-600/20 bg-amber-600/5'
    default: return 'text-gray-400'
  }
}
</script>
