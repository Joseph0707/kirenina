<template>
  <div v-if="!isInitialized" class="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div class="bg-gray-900 border border-gray-700 p-8 rounded-xl max-w-md w-full shadow-2xl">
      <h2 class="text-3xl font-display font-bold text-primary mb-2">Bienvenue sur Kirenina</h2>
      <p class="text-gray-400 mb-6">Choisissez un pseudo pour commencer à jouer.</p>
      
      <form @submit.prevent="submit" class="flex flex-col gap-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-300 mb-1">Pseudo</label>
          <input 
            id="username"
            v-model="username" 
            type="text" 
            required
            class="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            placeholder="Ex: JoueurPro"
            minlength="3"
            maxlength="20"
          />
        </div>
        
        <button 
          type="submit" 
          :disabled="loading || !username.trim()"
          class="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          <span v-if="loading">Chargement...</span>
          <span v-else>Jouer</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
const { isInitialized, checkAuth, initAuth } = useAuth()
const username = ref('')
const loading = ref(false)

onMounted(async () => {
  await checkAuth()
})

const submit = async () => {
  if (!username.value.trim()) return
  loading.value = true
  try {
    await initAuth(username.value.trim())
  } catch (error) {
    console.error('Erreur lors de l\\'initialisation', error)
  } finally {
    loading.value = false
  }
}
</script>
