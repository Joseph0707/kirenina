<template>
  <div v-if="!isInitialized" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-700 p-8 rounded-xl max-w-md w-full shadow-2xl">
      <h2 class="text-3xl font-display font-bold text-primary mb-2">{{ t('onboarding.title') }}</h2>
      <p class="text-gray-400 mb-6">{{ t('onboarding.subtitle') }}</p>
      
      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-1">{{ t('onboarding.username_label') }}</label>
          <input 
            id="username"
            v-model="username" 
            type="text" 
            required
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            :placeholder="t('onboarding.placeholder')"
            minlength="3"
            maxlength="20"
          />
        </div>

        <p v-if="errorMsg" class="text-red-400 text-sm font-medium bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span> {{ errorMsg }}
        </p>
        
        <button 
          type="submit" 
          :disabled="loading || !username.trim()"
          class="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <span v-if="loading">{{ t('onboarding.loading') }}</span>
          <span v-else>{{ t('onboarding.play') }}</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useI18n } from '~/composables/useI18n'

const { isInitialized, checkAuth, initAuth } = useAuth()
const { t } = useI18n()

const username = ref('')
const loading = ref(false)
const errorMsg = ref('')

onMounted(async () => {
  await checkAuth()
})

watch(username, () => {
  errorMsg.value = ''
})

const submit = async () => {
  if (!username.value.trim()) return
  loading.value = true
  errorMsg.value = ''
  try {
    await initAuth(username.value.trim())
  } catch (error: any) {
    console.error('Erreur lors de l\'initialisation', error)
    if (error.statusCode === 401 || error.status === 401 || error.data?.message?.includes('pris')) {
      errorMsg.value = t('onboarding.error_taken')
    } else {
      errorMsg.value = t('onboarding.error_generic')
    }
  } finally {
    loading.value = false
  }
}
</script>
