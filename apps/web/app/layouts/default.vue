<template>
  <div class="min-h-screen flex flex-col bg-dark text-light font-sans">
    <header class="p-4 border-b border-gray-800 flex justify-between items-center">
      <h1 class="text-2xl font-display font-bold text-primary">Kirenina</h1>
      <nav class="flex gap-4">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Accueil</NuxtLink>
        <NuxtLink to="/games/rummy" class="hover:text-primary transition-colors">Rami</NuxtLink>
      </nav>
    </header>
    <main class="flex-1 p-4">
      <slot />
    </main>
    <footer class="p-4 border-t border-gray-800 text-center text-sm text-gray-500">
      &copy; {{ new Date().getFullYear() }} Kirenina
    </footer>
  </div>
</template>
