<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CustomCursor from './components/CustomCursor.vue'
import bgImage from './assets/_ (78).jpeg'
</script>

<template>
  <CustomCursor />
  <div class="relative min-h-screen flex flex-col font-sans cursor-none">
    <!-- Background -->
    <div class="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" 
         :style="{ backgroundImage: `url('${bgImage}')` }">
         <div class="absolute inset-0 bg-white/30 backdrop-blur-xl"></div> 
    </div>

    <!-- Navigation -->
    <nav class="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 md:px-10 md:py-5 rounded-full shadow-2xl flex items-center justify-between md:justify-center gap-5 md:gap-12 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap w-[90%] max-w-[400px] md:w-auto md:max-w-none">
      <router-link to="/" class="cursor-pointer hover:text-zinc-400 transition" active-class="text-zinc-500">Concept</router-link>
      <router-link to="/gallery" class="cursor-pointer hover:text-zinc-400 transition" active-class="text-zinc-500">Collection</router-link>
      <router-link to="/curators" class="cursor-pointer hover:text-zinc-400 transition" active-class="text-zinc-500">Curators</router-link>
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
            <p>Designed by <span class="text-black font-bold">The Mind of S I R R</span></p>
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
