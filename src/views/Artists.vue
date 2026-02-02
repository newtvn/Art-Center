<script setup>
import { artists } from '../data'
</script>

<template>
  <section class="pt-40 px-6 max-w-5xl mx-auto w-full pb-20">
    <h2 class="text-5xl font-bold mb-20">The Curators</h2>
    <div class="space-y-32">
        <div v-for="artist in artists" :key="artist.name" class="flex flex-col md:flex-row gap-16 items-center">
            <img :src="artist.photo" class="w-64 h-80 object-cover rounded-apple grayscale shadow-xl">
            <div>
                <h3 class="text-3xl font-bold mb-4">{{artist.name}}</h3>
                <p class="text-zinc-500 leading-relaxed text-lg mb-6">{{artist.longBio}}</p>
                <div class="flex gap-4">
                    <span class="text-[10px] font-bold uppercase border border-zinc-200 px-3 py-1 rounded-full">{{artist.specialty}}</span>
                </div>
            </div>
        </div>
    </div>
  </section>
</template>
