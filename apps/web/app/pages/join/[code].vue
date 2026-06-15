<template>
  <div class="max-w-md mx-auto py-12 px-4 text-center">
    <OnboardingModal />

    <div class="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl flex flex-col items-center">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center gap-4 py-8">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p class="text-gray-300 font-medium animate-pulse">
          Recherche de la salle en cours...
        </p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="space-y-6">
        <div class="text-5xl">⚠️</div>
        <h3 class="text-2xl font-display font-bold text-white">
          {{ t('errors.room_code_invalid') }}
        </h3>
        <p class="text-gray-400 text-sm max-w-xs mx-auto">
          {{ errorMsg || 'Le code de salon est incorrect ou le salon n\'existe plus.' }}
        </p>
        
        <button 
          @click="goBackToLobby"
          class="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/10 hover:shadow-primary/20"
        >
          Retour au Lobby
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from '~/composables/useI18n'
import { useAuth } from '~/composables/useAuth'
import { useApi } from '~/composables/useApi'

const { t } = useI18n()
const route = useRoute()
const { isInitialized } = useAuth()
const { fetchApi } = useApi()

const loading = ref(true)
const error = ref(false)
const errorMsg = ref('')

const resolveCode = async () => {
  const code = route.params.code
  if (!code || typeof code !== 'string') {
    error.value = true
    errorMsg.value = t('errors.room_code_invalid')
    loading.value = false
    return
  }

  loading.value = true
  error.value = false

  try {
    const room = await fetchApi<{ id: string }>('/rooms/code/' + code.toUpperCase())
    // Success - redirect to Rummy room page
    navigateTo(`/games/rummy/${room.id}`)
  } catch (err: any) {
    console.error('Failed to resolve room code:', err)
    error.value = true
    if (err.status === 404 || err.statusCode === 404) {
      errorMsg.value = t('errors.room_not_found')
    } else {
      errorMsg.value = err.data?.message || 'Impossible de rejoindre la salle avec ce code.'
    }
  } finally {
    loading.value = false
  }
}

// Watch for authentication init to resolve code
watch(() => isInitialized.value, (newVal) => {
  if (newVal) {
    resolveCode()
  }
}, { immediate: true })

onMounted(() => {
  if (isInitialized.value) {
    resolveCode()
  }
})

const goBackToLobby = () => {
  navigateTo('/games/rummy')
}
</script>
