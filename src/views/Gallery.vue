<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { artworks, categories } from '../data'

const router = useRouter()
const filter = ref('All')

const filteredArt = computed(() => {
    if (filter.value === 'All') return artworks;
    return artworks.filter(a => a.category === filter.value);
});

const openArt = (art) => {
    router.push({ name: 'art-detail', params: { id: art.id } })
};
</script>

<template>
  <section class="pt-40 px-6 max-w-7xl mx-auto w-full pb-20">
    <div class="flex flex-col md:flex-row justify-between items-baseline mb-12 md:mb-20 border-b border-transparent pb-10">
        <h2 class="text-4xl md:text-5xl font-bold tracking-tight">Current Collection</h2>
        <div class="flex gap-4 mt-6 md:mt-0 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button v-for="c in categories" :key="c" @click="filter = c" 
                    :class="filter === c ? 'bg-black text-white' : 'text-zinc-500 bg-white/50'"
                    class="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full transition whitespace-nowrap flex-shrink-0 border border-transparent hover:border-zinc-200">
                {{c}}
            </button>
        </div>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        <div v-for="(art, index) in filteredArt" :key="art.id" @click="openArt(art)" 
             v-reveal="{ delay: index * 0.1, scale: 0.95 }"
             class="group cursor-pointer">
            <div class="overflow-hidden rounded-apple bg-zinc-100 aspect-[3/4] mb-6 shadow-sm group-hover:shadow-2xl transition-all duration-700">
                <img :src="art.image" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-transform duration-1000 group-hover:scale-105">
            </div>
            <div class="flex justify-between items-start px-2">
                <div>
                    <h3 class="text-lg font-bold">{{art.title}}</h3>
                    <p class="text-zinc-400 text-sm">{{art.author}}</p>
                </div>
                <p class="font-medium text-sm">${{art.price}}</p>
            </div>
        </div>
    </div>
  </section>
</template>
