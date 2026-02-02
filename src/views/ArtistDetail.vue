<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { artists, artworks } from '../data'

const route = useRoute()
const router = useRouter()

// Decode name parameter to handle spaces
const artistName = computed(() => {
    return route.params.name ? decodeURIComponent(route.params.name) : ''
})

const artist = computed(() => artists.find(a => a.name === artistName.value))
const artistWorks = computed(() => artworks.filter(a => a.author === artistName.value))

const openArt = (art) => {
    router.push({ name: 'art-detail', params: { id: art.id } })
}

const back = () => router.push({ name: 'artists' })
</script>

<template>
  <div v-if="artist" class="min-h-screen pt-40 px-6 max-w-7xl mx-auto w-full pb-20">
    <!-- Back Button -->
    <button @click="back" class="mb-12 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 px-4 py-2 rounded-full hover:bg-black hover:text-white transition">&larr; Back to Curators</button>

    <!-- Profile Header -->
    <div class="flex flex-col md:flex-row gap-12 md:gap-20 items-start mb-24">
        <div v-reveal class="w-full md:w-1/3">
             <div class="aspect-[3/4] overflow-hidden rounded-apple shadow-2xl">
                <img :src="artist.photo" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700">
             </div>
        </div>
        <div class="w-full md:w-2/3 pt-4">
            <h1 v-reveal="{ delay: 0.1 }" class="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-none">{{artist.name}}</h1>
            <span v-reveal="{ delay: 0.2 }" class="text-[10px] font-bold uppercase border border-zinc-300 px-4 py-2 rounded-full mb-8 inline-block">{{artist.specialty}}</span>
            <p v-reveal="{ delay: 0.3 }" class="text-xl md:text-2xl leading-relaxed text-zinc-600 font-light max-w-2xl">{{artist.longBio}}</p>
        </div>
    </div>

    <!-- Works Grid -->
    <div v-if="artistWorks.length > 0">
        <h2 v-reveal class="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-12 border-b border-zinc-100 pb-4">Curated Collection</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            <div v-for="(art, index) in artistWorks" :key="art.id" @click="openArt(art)" 
                 v-reveal="{ delay: index * 0.1 + 0.4 }"
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
    </div>
    <div v-else class="py-20 text-center opacity-50">
        <p>No public works currently available.</p>
    </div>
  </div>
  <div v-else class="min-h-screen flex items-center justify-center">
    <p>Artist not found.</p>
  </div>
</template>
