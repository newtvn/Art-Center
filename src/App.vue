<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import CustomCursor from './components/CustomCursor.vue'

const route = useRoute()
const isAdmin = computed(() => route.path.startsWith('/admin'))
</script>

<template>
  <CustomCursor />
  <div class="relative min-h-screen flex flex-col font-sans cursor-none text-zinc-900">
    <!-- Old Gazette Background -->
    <!-- Old Gazette Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <!-- Base Parchment Color -->
        <div class="absolute inset-0 bg-[#E8E4D9]"></div>
        
        <!-- Subtle Cracks/Veins -->
        <div class="absolute inset-0 opacity-40 mix-blend-multiply bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxmaWx0ZXIgaWQ9ImNyYWNrcyI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuMDAxIiBudW1PY3RhdmVzPSI1IiByZXN1bHQ9Im5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ibWF0cml4IiB2YWx1ZXM9IjAgMCAwIDAgMC40ICAwIDAgMCAwIDAuNCAgMCAwIDAgMCAwLjQgIDAgMCAwIDUwIC0zMCIgaW49Im5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2NyYWNrcykiLz48L3N2Zz4=')]"></div>

        <!-- Noise Texture -->
        <div class="absolute inset-0 opacity-70 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlci4+PHJlY3Qgd2lkdGg9IjEwMCUiIGheiWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+')]"></div>
    </div>

    <!-- Navigation -->
    <nav v-if="!isAdmin" class="fixed top-4 md:top-8 left-1/2 -translate-x-1/2 z-50 glass px-6 py-4 md:px-10 md:py-5 rounded-full shadow-2xl flex items-center justify-between md:justify-center gap-5 md:gap-12 text-[10px] md:text-xs font-bold uppercase tracking-widest whitespace-nowrap w-[90%] max-w-[400px] md:w-auto md:max-w-none">
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
    <footer v-if="!isAdmin" class="relative z-10 mt-auto py-20 px-6 border-t border-transparent text-center opacity-60">
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
