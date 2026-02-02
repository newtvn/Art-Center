<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import CustomCursor from './components/CustomCursor.vue'
</script>

<template>
  <CustomCursor />
  <div class="relative min-h-screen flex flex-col font-sans cursor-none text-zinc-900">
    <!-- Old Gazette Background -->
    <div class="fixed inset-0 z-0 pointer-events-none">
        <!-- Base Parchment Color -->
        <div class="absolute inset-0 bg-[#E8E4D9]"></div>
        
        <!-- Noise Texture -->
        <div class="absolute inset-0 opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuNjUiIG51bU9jdGF2ZXM9IjMiIHN0aXRjaFRpbGVzPSJzdGl0Y2giLz48L2ZpbHRlcj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWx0ZXI9InVybCgjbm9pc2UpIiBvcGFjaXR5PSIwLjUiLz48L3N2Zz4=')]"></div>
        
        <!-- Vignette -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.15)_100%)]"></div>
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
    <footer class="relative z-10 mt-auto py-20 px-6 border-t border-transparent text-center opacity-60">
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
