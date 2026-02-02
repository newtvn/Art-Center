<script setup>
import { artists } from '../data'
</script>

<template>
  <section class="pt-40 px-6 max-w-5xl mx-auto w-full pb-20">
    <h2 class="text-5xl font-bold mb-20">The Curators</h2>
    <div class="space-y-20 md:space-y-32">
        <div v-for="(artist, index) in artists" :key="artist.name" 
             v-reveal="{ delay: index * 0.2 }"
             class="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <img :src="artist.photo" class="w-full max-w-[320px] md:w-64 aspect-[3/4] object-cover rounded-apple grayscale shadow-xl">
            <div class="text-center md:text-left">
                <h3 class="text-3xl font-bold mb-4">{{artist.name}}</h3>
                <p class="text-zinc-500 leading-relaxed text-lg mb-6">{{artist.longBio}}</p>
                <div class="flex gap-4 justify-center md:justify-start">
                    <span class="text-[10px] font-bold uppercase border border-zinc-200 px-3 py-1 rounded-full">{{artist.specialty}}</span>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>
