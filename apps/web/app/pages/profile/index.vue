<template>
  <div class="max-w-4xl mx-auto py-8">
    <div v-if="!user" class="flex flex-col items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p class="text-gray-400">Chargement du profil...</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <!-- Left column: Profile Edit -->
      <div class="md:col-span-1 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl h-fit">
        <h2 class="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
          <span>⚙️</span> {{ $t('profile.edit_profile') }}
        </h2>

        <form @submit.prevent="saveProfile" class="space-y-6">
          <!-- Current Avatar display & selection -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-3">{{ $t('profile.select_avatar') }}</label>
            <div class="flex justify-center mb-4">
              <div class="text-6xl p-4 bg-gray-900 border-2 border-primary/40 rounded-full w-24 h-24 flex items-center justify-center shadow-inner select-none">
                {{ form.avatarUrl || '👤' }}
              </div>
            </div>
            
            <div class="grid grid-cols-4 gap-2 bg-gray-900 p-3 rounded-lg border border-gray-700 max-h-40 overflow-y-auto">
              <button 
                v-for="emoji in avatars" 
                :key="emoji" 
                type="button"
                @click="form.avatarUrl = emoji"
                class="text-2xl p-1.5 rounded hover:bg-gray-800 transition-colors focus:outline-none"
                :class="form.avatarUrl === emoji ? 'bg-primary/20 border border-primary scale-110' : 'border border-transparent'"
              >
                {{ emoji }}
              </button>
            </div>
          </div>

          <!-- Username Input -->
          <div>
            <label for="profile-username" class="block text-sm font-medium text-gray-300 mb-1">{{ $t('profile.username') }}</label>
            <input 
              id="profile-username"
              v-model="form.username" 
              type="text" 
              required
              minlength="3"
              maxlength="20"
              class="w-full bg-gray-900 border border-gray-750 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          <!-- Visibility Toggle -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">{{ $t('profile.visibility') }}</label>
            <div class="space-y-2">
              <label class="flex items-center gap-3 cursor-pointer bg-gray-900/40 p-3 rounded-lg border border-gray-750 hover:border-gray-600 transition-colors">
                <input 
                  type="radio" 
                  v-model="form.isPublic" 
                  :value="true"
                  class="text-primary focus:ring-primary"
                />
                <div>
                  <span class="text-sm font-semibold text-white block">{{ $t('profile.public') }}</span>
                </div>
              </label>
              
              <label class="flex items-center gap-3 cursor-pointer bg-gray-900/40 p-3 rounded-lg border border-gray-750 hover:border-gray-600 transition-colors">
                <input 
                  type="radio" 
                  v-model="form.isPublic" 
                  :value="false"
                  class="text-primary focus:ring-primary"
                />
                <div>
                  <span class="text-sm font-semibold text-white block">{{ $t('profile.private') }}</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Status Notifications -->
          <p v-if="successMsg" class="text-emerald-400 text-sm font-semibold bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2">
            <span>✅</span> {{ successMsg }}
          </p>
          
          <p v-if="errorMsg" class="text-red-400 text-sm font-semibold bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-center gap-2">
            <span>⚠️</span> {{ errorMsg }}
          </p>

          <!-- Submit Button -->
          <button 
            type="submit" 
            :disabled="saving || !form.username.trim()"
            class="w-full bg-primary hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            <span>{{ saving ? $t('profile.saving') : $t('profile.save') }}</span>
          </button>
        </form>
      </div>

      <!-- Right column: Stats & Achievements -->
      <div class="md:col-span-2 space-y-6">
        <div class="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-xl">
          <h2 class="text-2xl font-display font-bold text-primary mb-6 flex items-center gap-2">
            <span>📊</span> {{ $t('profile.stats_title') }}
          </h2>

          <div class="grid grid-cols-2 gap-4">
            <!-- Points Card -->
            <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750">
              <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ $t('profile.points') }}</span>
              <div class="text-3xl font-extrabold text-primary mt-1">{{ user.totalPoints }}</div>
            </div>

            <!-- Medal Card -->
            <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750 flex items-center justify-between">
              <div>
                <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ $t('profile.medal') }}</span>
                <div class="text-xl font-bold mt-1 text-white">{{ $t(`profile.medals.${user.medal}`) }}</div>
              </div>
              <div class="text-4xl">
                {{ getMedalEmoji(user.medal) }}
              </div>
            </div>

            <!-- Games Played Card -->
            <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750">
              <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ $t('profile.games_played') }}</span>
              <div class="text-3xl font-extrabold text-white mt-1">{{ user.gamesPlayed }}</div>
            </div>

            <!-- Win Rate Card -->
            <div class="bg-gray-900/60 p-5 rounded-xl border border-gray-750 flex items-center justify-between">
              <div>
                <span class="text-gray-400 text-xs uppercase font-bold tracking-wider">{{ $t('profile.win_rate') }}</span>
                <div class="text-3xl font-extrabold text-secondary mt-1">{{ user.winRate }}%</div>
              </div>
              <!-- Mini progress circle -->
              <div class="relative h-12 w-12 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" class="text-gray-800" stroke-width="4" fill="transparent" />
                  <circle cx="24" cy="24" r="20" stroke="currentColor" class="text-secondary" stroke-width="4" fill="transparent"
                    :stroke-dasharray="2 * Math.PI * 20"
                    :stroke-dashoffset="2 * Math.PI * 20 * (1 - user.winRate / 100)"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra achievement section (for future scale, visual candy) -->
        <div class="bg-gray-800/50 border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 text-9xl text-gray-700/10 pointer-events-none font-extrabold">🏆</div>
          <h3 class="text-lg font-bold mb-2 text-white">Prêt à affronter des adversaires ?</h3>
          <p class="text-sm text-gray-400 max-w-md">
            Vos statistiques et votre médaille évoluent à chaque partie jouée. Améliorez votre classement pour décrocher la médaille d'Or !
          </p>
          <button class="mt-4 bg-secondary hover:bg-indigo-600 text-white font-medium text-sm py-2 px-4 rounded-lg transition-colors" @click="navigateTo('/games/rummy')">
            Lancer une partie de Rami
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watchEffect } from 'vue'

const { user, updateProfile, checkAuth } = useAuth()
const { t } = useI18n()

const saving = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

// Predefined premium avatar emojis
const avatars = ['🃏', '👑', '🧙‍♂️', '🦊', '⚔️', '🎭', '🐱', '🐶', '🦄', '🐼', '🐉', '🦁', '🦉', '👽', '💀', '🍀']

const form = reactive({
  username: '',
  avatarUrl: '' as string | null,
  isPublic: true
})

onMounted(async () => {
  const ok = await checkAuth()
  if (!ok) {
    navigateTo('/')
  }
})

// Bind form data once user loaded
watchEffect(() => {
  if (user.value) {
    form.username = user.value.username
    form.avatarUrl = user.value.avatarUrl
    form.isPublic = user.value.isPublic
  }
})

const saveProfile = async () => {
  if (!form.username.trim()) return
  saving.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    await updateProfile({
      username: form.username.trim(),
      avatarUrl: form.avatarUrl,
      isPublic: form.isPublic
    })
    successMsg.value = t('profile.success')
    setTimeout(() => {
      successMsg.value = ''
    }, 4000)
  } catch (err: any) {
    console.error('Save profile error:', err)
    if (err.statusCode === 400 || err.status === 400 || err.data?.message?.includes('pris')) {
      errorMsg.value = t('onboarding.error_taken')
    } else {
      errorMsg.value = t('onboarding.error_generic')
    }
  } finally {
    saving.value = false
  }
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
