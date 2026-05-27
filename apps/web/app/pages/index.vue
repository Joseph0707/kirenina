<template>
  <div class="max-w-4xl mx-auto py-8">
    <OnboardingModal />
    
    <div class="text-center mb-12">
      <h2 class="text-5xl font-display font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
        Plateforme de Jeux Multijoueur
      </h2>
      <p class="text-xl text-gray-400 max-w-2xl mx-auto">
        Jouez au Rami en 3D avec vos amis. Sans inscription, gratuit et en temps réel.
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Games list -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-primary transition-colors group cursor-pointer" @click="navigateTo('/games/rummy')">
        <div class="flex justify-between items-start mb-4">
          <div class="text-4xl">🃏</div>
          <span class="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">Populaire</span>
        </div>
        <h3 class="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">Rami (Rummy)</h3>
        <p class="text-gray-400 mb-4">
          Le classique jeu de cartes en version 104 cartes avec animations 3D.
        </p>
        <button class="bg-gray-700 hover:bg-primary w-full py-2 rounded-lg font-medium transition-colors">
          Jouer au Rami
        </button>
      </div>
      
      <!-- Leaderboard preview -->
      <div class="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 class="text-xl font-bold mb-4 flex items-center gap-2">
          <span>🏆</span> Top Joueurs
        </h3>
        <div class="space-y-3">
          <div v-for="i in 3" :key="i" class="flex items-center justify-between bg-gray-900 p-3 rounded-lg">
            <div class="flex items-center gap-3">
              <span class="text-lg font-bold" :class="getMedalColor(i)">#{{ i }}</span>
              <span class="font-medium">Joueur {{ i }}</span>
            </div>
            <span class="text-primary font-bold">{{ 1000 - i * 50 }} pts</span>
          </div>
        </div>
        <button class="w-full text-center text-sm text-gray-400 hover:text-white mt-4 transition-colors" @click="navigateTo('/leaderboard')">
          Voir tout le classement
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const getMedalColor = (rank: number) => {
  switch(rank) {
    case 1: return 'text-yellow-400'
    case 2: return 'text-gray-300'
    case 3: return 'text-amber-600'
    default: return 'text-gray-500'
  }
}
</script>
