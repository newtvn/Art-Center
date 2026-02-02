<template>
  <div class="relative min-h-screen flex flex-col font-sans">
    <!-- Background Grain -->
    <div class="bg-grain fixed inset-0 z-0"></div>

    <!-- Navigation -->
    <nav class="fixed top-8 left-1/2 -translate-x-1/2 z-50 glass px-10 py-5 rounded-full shadow-2xl flex gap-8 md:gap-12 text-xs font-bold uppercase tracking-widest whitespace-nowrap">
      <router-link to="/" class="cursor-pointer hover:text-zinc-400 transition" active-class="text-zinc-500">Concept</router-link>
      <router-link to="/gallery" class="cursor-pointer hover:text-zinc-400 transition" active-class="text-zinc-500">Collection</router-link>
      <router-link to="/curators" class="cursor-pointer hover:text-zinc-400 transition" active-class="text-zinc-500">Curators</router-link>
      <!-- We can use a hash link or a route for Contact. Original code had #contact anchor. -->
      <a href="#contact" class="hover:text-zinc-400 transition">Contact</a>
    </nav>

    <!-- Main Content -->
    <main class="relative z-10 flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 mt-auto py-20 px-6 border-t border-zinc-100 text-center opacity-60 bg-white/50 backdrop-blur-sm">
        <p class="text-[10px] font-bold tracking-[0.4em] uppercase mb-4">The Art Center © 2026</p>
        <div class="text-xs space-y-2">
            <p>Designed by <span class="text-black font-bold">N E W T V N</span></p>
            <p>Contact: <a href="tel:0110952788" class="underline">0110952788</a></p>
        </div>
    </footer>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
