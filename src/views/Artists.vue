<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const artists = ref([])
const loading = ref(true)

onMounted(async () => {
    const { data, error } = await supabase
        .from('artists')
        .select('*')
    
    if (data) artists.value = data
    loading.value = false
})

const openArtist = (artist) => {
    // Navigate using name for pretty URLs, ensuring we decode/encode properly
    router.push({ name: 'artist-detail', params: { name: artist.name } })
}

const handleImageError = (e) => {
    e.target.src = 'https://images.unsplash.com/photo-1544986181-421710baa721?q=80&w=400' 
}
</script>

<template>
  <section class="pt-40 px-6 max-w-5xl mx-auto w-full pb-20">
    <h2 class="text-5xl font-bold mb-20">The Curators</h2>
    <div class="space-y-20 md:space-y-32">
        <div v-for="(artist, index) in artists" :key="artist.name" 
             @click="openArtist(artist)"
             v-reveal="{ delay: index * 0.2 }"
             class="flex flex-col md:flex-row gap-8 md:gap-16 items-center group cursor-pointer">
            <div class="overflow-hidden rounded-apple shadow-xl aspect-[3/4] w-full max-w-[320px] md:w-80 flex-shrink-0 bg-zinc-100">
                <img :src="artist.photo" @error="handleImageError" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700 group-hover:scale-105">
            </div>
            <div class="text-center md:text-left group-hover:translate-x-4 transition duration-500">
                <h3 class="text-3xl font-bold mb-4">{{artist.name}}</h3>
                <p class="text-zinc-500 leading-relaxed text-lg mb-6">{{artist.long_bio}}</p>
                <div class="flex gap-4 justify-center md:justify-start">
                    <span class="text-[10px] font-bold uppercase border border-zinc-200 px-3 py-1 rounded-full">{{artist.specialty}}</span>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>
