<template>
  <div class="max-w-6xl mx-auto py-8 px-4">
    <!-- Component that handles onboarding if not logged in -->
    <OnboardingModal />

    <!-- Header & Socket Status Indicator -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
      <div>
        <h2 class="text-4xl font-display font-bold text-white mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          {{ t('lobby.title') }}
        </h2>
        <p class="text-gray-400 max-w-lg">
          {{ t('lobby.subtitle') }}
        </p>
      </div>

      <div class="flex items-center gap-4">
        <!-- Socket Status Badge -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-900 border border-gray-800">
          <span class="relative flex h-2.5 w-2.5">
            <span 
              class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              :class="isConnected ? 'bg-primary' : 'bg-red-500'"
            ></span>
            <span 
              class="relative inline-flex rounded-full h-2.5 w-2.5"
              :class="isConnected ? 'bg-primary' : 'bg-red-500'"
            ></span>
          </span>
          <span class="text-xs font-semibold text-gray-300">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </span>
        </div>

        <!-- Button to open room creation modal -->
        <button 
          @click="openCreateModal"
          class="bg-primary hover:bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 hover:scale-102 transition-all flex items-center gap-2 text-sm"
        >
          <span>➕</span> {{ t('lobby.create_room') }}
        </button>
      </div>
    </div>

    <!-- Filters and Search Bar -->
    <div class="flex flex-col md:flex-row gap-4 mb-8">
      <!-- Search Input -->
      <div class="flex-1 relative">
        <span class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
          🔍
        </span>
        <input 
          type="text" 
          v-model="searchQuery"
          class="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-gray-500 shadow-inner"
          :placeholder="t('lobby.search_placeholder')"
        />
      </div>

      <!-- Filter Dropdown -->
      <div class="w-full md:w-56">
        <select 
          v-model="statusFilter"
          class="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-all cursor-pointer shadow-inner"
        >
          <option value="ALL">{{ t('lobby.filters.all') }}</option>
          <option value="WAITING">{{ t('lobby.filters.waiting') }}</option>
          <option value="IN_PROGRESS">{{ t('lobby.filters.in_progress') }}</option>
        </select>
      </div>
    </div>

    <!-- Rooms Loading / Listing -->
    <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="i in 6" 
        :key="i"
        class="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 animate-pulse flex flex-col gap-4 h-48"
      >
        <div class="h-6 bg-gray-800 rounded w-2/3"></div>
        <div class="h-4 bg-gray-800 rounded w-1/2"></div>
        <div class="h-4 bg-gray-800 rounded w-1/3 mt-auto"></div>
      </div>
    </div>

    <div v-else-if="filteredRooms.length === 0" class="flex flex-col items-center justify-center py-20 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/10">
      <span class="text-5xl mb-4">🎴</span>
      <h3 class="text-xl font-bold text-white mb-2">{{ t('lobby.no_rooms') }}</h3>
      <button 
        @click="openCreateModal"
        class="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-light px-4 py-2 rounded-xl mt-2 transition-all"
      >
        {{ t('lobby.create_room') }}
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="room in filteredRooms" 
        :key="room.id"
        class="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-6 flex flex-col justify-between hover:border-gray-700 hover:scale-101 transition-all group"
      >
        <div>
          <div class="flex justify-between items-start gap-4 mb-3">
            <h3 class="font-display font-bold text-lg text-white truncate group-hover:text-primary transition-colors">
              {{ room.name }}
            </h3>
            <!-- Visibility Status Indicator -->
            <span class="text-xs text-gray-500 font-semibold select-none">
              {{ room.gameType }}
            </span>
          </div>

          <div class="text-sm text-gray-400 mb-4 flex flex-col gap-1.5">
            <div class="flex items-center gap-2">
              <span class="text-xs">👤</span> 
              <span>{{ t('lobby.creator') }}: <strong class="text-gray-300">{{ room.creatorUsername }}</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs">🕒</span> 
              <span>{{ formatDate(room.createdAt) }}</span>
            </div>
          </div>
        </div>

        <div class="mt-auto pt-4 border-t border-gray-800/60 flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
              {{ t('lobby.players') }}
            </span>
            <span class="text-sm font-semibold" :class="room.currentPlayers >= room.maxPlayers ? 'text-primary' : 'text-light'">
              {{ room.currentPlayers }} / {{ room.maxPlayers }}
            </span>
          </div>

          <div class="flex items-center gap-2">
            <!-- Room status badge -->
            <span 
              class="text-xs font-semibold px-2 py-1 rounded border"
              :class="getStatusBadgeClass(room.status)"
            >
              {{ t(`lobby.status_${room.status.toLowerCase()}`) }}
            </span>

            <!-- Join / Spectate Button -->
            <button 
              v-if="room.status === 'WAITING' && room.currentPlayers < room.maxPlayers"
              @click="joinRoom(room.id)"
              class="bg-primary hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
            >
              {{ t('lobby.join') }}
            </button>
            <button 
              v-else
              @click="joinRoom(room.id)"
              class="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium py-2 px-4 rounded-xl text-xs transition-colors"
            >
              {{ t('lobby.spectate') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Room Modal Dialog -->
    <div 
      v-if="isCreateModalOpen" 
      class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-md"
    >
      <div 
        class="bg-gray-900 border border-gray-800 p-8 rounded-2xl max-w-md w-full shadow-2xl animate-scale-up"
      >
        <h3 class="text-2xl font-display font-bold text-white mb-6">
          {{ t('create_room_modal.title') }}
        </h3>

        <form @submit.prevent="submitCreateRoom" class="space-y-5">
          <!-- Room Name Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-1.5">
              {{ t('create_room_modal.room_name_label') }}
            </label>
            <input 
              v-model="form.name"
              type="text"
              required
              class="w-full bg-gray-800 border border-gray-750 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary transition-colors"
              :placeholder="t('create_room_modal.room_name_placeholder')"
            />
            <p v-if="createErrors.name" class="text-red-400 text-xs mt-1">
              {{ createErrors.name }}
            </p>
          </div>

          <!-- Visibility Select -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-1.5">
              {{ t('create_room_modal.visibility_label') }}
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                type="button"
                @click="form.isPublic = true"
                class="px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all text-center"
                :class="form.isPublic ? 'bg-primary/10 border-primary text-primary' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-light'"
              >
                🌍 Public
              </button>
              <button 
                type="button"
                @click="form.isPublic = false"
                class="px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all text-center"
                :class="!form.isPublic ? 'bg-secondary/10 border-secondary text-secondary' : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-light'"
              >
                🔒 {{ t('create_room_modal.visibility_private').split(' ')[0] }}
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1.5">
              {{ form.isPublic ? t('create_room_modal.visibility_public') : t('create_room_modal.visibility_private') }}
            </p>
          </div>

          <!-- Grid for Max Players and Total Rounds -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Max Players -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-1.5">
                {{ t('create_room_modal.max_players_label') }}
              </label>
              <select 
                v-model="form.maxPlayers"
                class="w-full bg-gray-800 border border-gray-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option :value="2">2 {{ t('lobby.players').toLowerCase() }}</option>
                <option :value="3">3 {{ t('lobby.players').toLowerCase() }}</option>
                <option :value="4">4 {{ t('lobby.players').toLowerCase() }}</option>
              </select>
              <p v-if="createErrors.maxPlayers" class="text-red-400 text-xs mt-1">
                {{ createErrors.maxPlayers }}
              </p>
            </div>

            <!-- Total Rounds -->
            <div>
              <label class="block text-sm font-semibold text-gray-300 mb-1.5">
                {{ t('create_room_modal.total_rounds_label') }}
              </label>
              <select 
                v-model="form.totalRounds"
                class="w-full bg-gray-800 border border-gray-750 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-primary transition-colors cursor-pointer"
              >
                <option v-for="r in 10" :key="r" :value="r">
                  {{ r }} {{ r > 1 ? 'manches' : 'manche' }}
                </option>
              </select>
              <p v-if="createErrors.totalRounds" class="text-red-400 text-xs mt-1">
                {{ createErrors.totalRounds }}
              </p>
            </div>
          </div>

          <!-- Allow Spectators Switch Toggle -->
          <div class="flex items-center justify-between py-2">
            <span class="text-sm font-semibold text-gray-300">
              {{ t('create_room_modal.allow_spectators_label') }}
            </span>
            <button 
              type="button"
              @click="form.allowSpectators = !form.allowSpectators"
              class="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300"
              :class="form.allowSpectators ? 'bg-primary' : 'bg-gray-750'"
            >
              <div 
                class="bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300"
                :class="{ 'translate-x-6': form.allowSpectators }"
              ></div>
            </button>
          </div>

          <!-- Error Alert Banner -->
          <div v-if="createErrors.global" class="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold">
            {{ createErrors.global }}
          </div>

          <!-- Buttons -->
          <div class="flex gap-3 pt-4 border-t border-gray-850">
            <button 
              type="button"
              @click="closeCreateModal"
              class="flex-1 bg-gray-850 hover:bg-gray-800 text-gray-300 font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {{ t('create_room_modal.cancel') }}
            </button>
            <button 
              type="submit" 
              :disabled="createLoading"
              class="flex-1 bg-primary hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 text-sm"
            >
              <span v-if="createLoading">{{ t('create_room_modal.creating') }}</span>
              <span v-else>{{ t('create_room_modal.submit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'
import { useSocket } from '~/composables/useSocket'
import { createRoomSchema } from '@kirenina/utils'
import type { RoomListItem } from '@kirenina/shared-types'
import { z } from 'zod'

const { t } = useI18n()
const { user, isInitialized } = useAuth()
const { fetchApi } = useApi()
const { socket, isConnected, connect, disconnect } = useSocket()

const rooms = ref<RoomListItem[]>([])
const loading = ref(true)
const searchQuery = ref('')
const statusFilter = ref<'ALL' | 'WAITING' | 'IN_PROGRESS'>('ALL')

// Create Room Modal state
const isCreateModalOpen = ref(false)
const createLoading = ref(false)
const createErrors = ref<Record<string, string>>({})

const form = ref({
  name: '',
  isPublic: true,
  gameType: 'RUMMY' as const,
  maxPlayers: 4,
  totalRounds: 3,
  allowSpectators: true
})

// Initialize WebSockets logic on authentication ready
const initializeSocket = () => {
  const ws = connect()
  if (ws) {
    ws.emit('lobby:subscribe', { gameType: 'RUMMY' })

    ws.on('lobby:roomsList', (data) => {
      rooms.value = data.rooms
      loading.value = false
    })

    ws.on('lobby:roomAdded', (data) => {
      if (!rooms.value.some(r => r.id === data.room.id)) {
        rooms.value.push(data.room)
      }
    })

    ws.on('lobby:roomUpdated', (data) => {
      const idx = rooms.value.findIndex(r => r.id === data.room.id)
      if (idx !== -1) {
        rooms.value[idx] = data.room
      } else {
        rooms.value.push(data.room)
      }
    })

    ws.on('lobby:roomRemoved', (data) => {
      rooms.value = rooms.value.filter(r => r.id !== data.roomId)
    })
  }
}

watch(() => isInitialized.value, (val) => {
  if (val) {
    initializeSocket()
  } else {
    disconnect()
  }
}, { immediate: true })

onMounted(async () => {
  // If already authenticated, run immediately
  if (isInitialized.value) {
    initializeSocket()
  } else {
    // If checkAuth hasn't finished, wait
    setTimeout(() => {
      if (!isInitialized.value && !loading.value) {
        loading.value = false
      }
    }, 2000)
  }
})

onUnmounted(() => {
  if (socket.value) {
    socket.value.emit('lobby:unsubscribe')
    socket.value.off('lobby:roomsList')
    socket.value.off('lobby:roomAdded')
    socket.value.off('lobby:roomUpdated')
    socket.value.off('lobby:roomRemoved')
  }
})

// Computed list of filtered rooms
const filteredRooms = computed(() => {
  return rooms.value.filter(room => {
    // Filter by search query
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      room.creatorUsername.toLowerCase().includes(searchQuery.value.toLowerCase())

    if (!matchesSearch) return false

    // Filter by status dropdown
    if (statusFilter.value === 'ALL') return true
    return room.status === statusFilter.value
  })
})

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'WAITING':
      return 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5'
    case 'STARTING':
      return 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5'
    case 'IN_PROGRESS':
      return 'text-primary border-primary/20 bg-primary/5'
    case 'FINISHED':
      return 'text-gray-400 border-gray-700 bg-gray-800/10'
    default:
      return 'text-light border-gray-800'
  }
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  } catch {
    return dateStr
  }
}

// Redirect and Join room
const joinRoom = (roomId: string) => {
  navigateTo(`/games/rummy/${roomId}`)
}

// Modal open/close actions
const openCreateModal = () => {
  form.value = {
    name: user.value ? `Salon de ${user.value.username}` : '',
    isPublic: true,
    gameType: 'RUMMY',
    maxPlayers: 4,
    totalRounds: 3,
    allowSpectators: true
  }
  createErrors.value = {}
  isCreateModalOpen.value = true
}

const closeCreateModal = () => {
  isCreateModalOpen.value = false
}

// Validation function using createRoomSchema Zod schema
const validateForm = () => {
  createErrors.value = {}
  try {
    createRoomSchema.parse({
      ...form.value,
      maxPlayers: Number(form.value.maxPlayers),
      totalRounds: Number(form.value.totalRounds)
    })
    return true
  } catch (err) {
    if (err instanceof z.ZodError) {
      err.errors.forEach(e => {
        if (e.path[0]) {
          createErrors.value[e.path[0].toString()] = e.message
        }
      })
    }
    return false
  }
}

// Create Room REST Call and redirection
const submitCreateRoom = async () => {
  if (!validateForm()) return

  createLoading.value = true
  try {
    const createdRoom = await fetchApi<{ id: string }>('/rooms', {
      method: 'POST',
      body: {
        name: form.value.name,
        isPublic: form.value.isPublic,
        gameType: form.value.gameType,
        maxPlayers: Number(form.value.maxPlayers),
        totalRounds: Number(form.value.totalRounds),
        allowSpectators: form.value.allowSpectators
      }
    })

    closeCreateModal()
    joinRoom(createdRoom.id)
  } catch (err: any) {
    console.error('Failed to create room:', err)
    createErrors.value.global = err.data?.message || 'Erreur lors de la création du salon.'
  } finally {
    createLoading.value = false
  }
}
</script>
