<template>
  <section class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <div class="max-w-4xl pt-20 md:pt-0">
        <p v-reveal class="text-zinc-800 uppercase tracking-[0.5em] text-[10px] mb-6">Established 2026</p>
        <h1 v-reveal="{ delay: 0.1 }" class="text-6xl sm:text-7xl md:text-9xl font-bold tracking-tighter mb-10 leading-[0.9]">THE ART<br>CENTER</h1>
        <div class="flex flex-col md:flex-row items-center gap-12 mt-12 md:mt-16 text-left border-t border-transparent pt-12 w-full">
            <p v-reveal="{ delay: 0.2 }" class="md:w-1/2 text-lg md:text-xl text-zinc-800 font-light leading-relaxed">
                A digital sanctuary where geometry meets human emotion. We curate objects that redefine spaces through minimalism and silent strength.
            </p>
            <div class="md:w-1/2 grid grid-cols-2 gap-8 w-full">
                <div v-reveal="{ delay: 0.3 }">
                    <h4 class="font-bold text-sm">Curation</h4>
                    <p class="text-xs text-zinc-600 mt-2">Sourced globally from neo-minimalist studios.</p>
                </div>
                <div v-reveal="{ delay: 0.4 }">
                    <h4 class="font-bold text-sm">Visualizer</h4>
                    <p class="text-xs text-zinc-600 mt-2">Proprietary tech to see art in your environment.</p>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>
