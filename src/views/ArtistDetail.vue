<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const artist = ref(null)
const artistWorks = ref([])
const loading = ref(true)

// Decode name parameter to handle spaces
const artistName = computed(() => {
    return route.params.name ? decodeURIComponent(route.params.name) : ''
})

const fetchData = async () => {
    loading.value = true
    // 1. Fetch Artist by Name
    const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('name', artistName.value)
        .single()
    
    if (artistData) {
        artist.value = artistData
        
        // 2. Fetch Works by Artist ID
        const { data: worksData } = await supabase
            .from('artworks')
            .select('*')
            .eq('artist_id', artistData.id)
            
        if (worksData) artistWorks.value = worksData
    }
    loading.value = false
}

onMounted(fetchData)
watch(artistName, fetchData)

const openArt = (art) => {
    router.push({ name: 'art-detail', params: { id: art.id } }) // Using UUID
}

const handleArtistImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1544986181-421710baa721?q=80&w=400' // Fallback minimalist portrait
}

const back = () => router.push({ name: 'artists' })
</script>

<template>
  <div v-if="artist" class="min-h-screen pt-40 px-6 max-w-7xl mx-auto w-full pb-20">
    <!-- Back Button -->
    <button @click="back" class="mb-12 text-[10px] font-bold uppercase tracking-widest text-zinc-800 border border-zinc-800 px-4 py-2 rounded-full hover:bg-black hover:text-white transition">&larr; Back to Curators</button>

    <!-- Profile Header -->
    <div class="flex flex-col md:flex-row gap-12 md:gap-20 items-start mb-24">
        <div v-reveal class="w-full md:w-1/3">
             <div class="aspect-[3/4] overflow-hidden rounded-apple shadow-2xl">
                <img :src="artist.photo" @error="handleArtistImageError" class="w-full h-full object-cover grayscale hover:grayscale-0 transition duration-700">
             </div>
        </div>
        <div class="w-full md:w-2/3 pt-4">
            <h1 v-reveal="{ delay: 0.1 }" class="text-6xl md:text-8xl font-bold mb-8 tracking-tighter leading-none">{{artist.name}}</h1>
            <span v-reveal="{ delay: 0.2 }" class="text-[10px] font-bold uppercase border border-zinc-800 px-4 py-2 rounded-full mb-8 inline-block text-zinc-800">{{artist.specialty}}</span>
            <p v-reveal="{ delay: 0.3 }" class="text-xl md:text-2xl leading-relaxed text-zinc-800 font-light max-w-2xl">{{artist.long_bio}}</p>
            
            <div v-reveal="{ delay: 0.4 }" class="flex gap-5 mt-8 items-center cursor-pointer relative z-20">
                <a v-if="artist.socials?.instagram" :href="artist.socials.instagram" target="_blank" class="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-800 hover:bg-zinc-900 hover:text-white transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
                <a v-if="artist.socials?.website" :href="artist.socials.website" target="_blank" class="w-10 h-10 border border-zinc-800 rounded-full flex items-center justify-center text-zinc-800 hover:bg-zinc-900 hover:text-white transition duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                </a>
            </div>
        </div>
    </div>

    <!-- Works Grid -->
    <div v-if="artistWorks.length > 0">
        <h2 v-reveal class="text-xs font-bold uppercase tracking-[0.3em] text-zinc-900 mb-12 border-b border-transparent pb-4">Curated Collection</h2>
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
                        <p class="text-zinc-400 text-sm">{{artist.name}}</p>
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
