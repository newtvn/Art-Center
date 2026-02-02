<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id) // ID is now UUID string
const art = ref(null)

const showVisualizer = ref(false)

onMounted(async () => {
    const { data } = await supabase
        .from('artworks')
        .select('*, artists(name)')
        .eq('id', id.value)
        .single()
        
    if (data) art.value = data
})
const wallColor = ref('#f4f4f5')
const colors = ['#f4f4f5', '#18181b', '#d4d4d8', '#fafaf9', '#fef2f2', '#ecfeff']

// Visualizer Controls
const scale = ref(1)
const position = ref({ x: 0, y: 0 })
const isDragging = ref(false)
let startPos = { x: 0, y: 0 }
let startMouse = { x: 0, y: 0 }

const onMouseDown = (e) => {
    isDragging.value = true
    startMouse = { x: e.clientX, y: e.clientY }
    startPos = { ...position.value }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e) => {
    if (!isDragging.value) return
    const dx = e.clientX - startMouse.x
    const dy = e.clientY - startMouse.y
    position.value = { x: startPos.x + dx, y: startPos.y + dy }
}

const onMouseUp = () => {
    isDragging.value = false
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
}

const close = () => {
    router.push({ name: 'gallery' })
}

const exitVisualizer = () => {
    showVisualizer.value = false
    position.value = { x: 0, y: 0 }
    scale.value = 1
}

onUnmounted(() => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div v-if="art" class="min-h-screen">
     <div class="pt-32 pb-24 md:pt-40 max-w-7xl mx-auto px-6 relative">
        <button @click="close" class="fixed top-32 right-12 z-[40] md:top-40 hover:rotate-90 transition-transform text-4xl font-light hidden md:block">&times;</button>
        <button @click="close" class="md:hidden mb-8 text-[10px] font-bold uppercase tracking-widest text-zinc-400 border border-zinc-200 px-4 py-2 rounded-full hover:bg-black hover:text-white transition">&larr; Back</button>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-20">
            <div class="space-y-8">
                <img :src="art.image" class="rounded-apple w-full shadow-2xl">
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-6 bg-zinc-50 rounded-apple">
                        <p class="text-[10px] font-bold text-zinc-400 uppercase mb-1">Dimensions</p>
                        <p class="text-sm">{{art.dimensions}}</p>
                    </div>
                    <div class="p-6 bg-zinc-50 rounded-apple">
                        <p class="text-[10px] font-bold text-zinc-400 uppercase mb-1">Origin</p>
                        <p class="text-sm font-medium">{{art.origin}}</p>
                    </div>
                </div>
                <button @click="showVisualizer = true" class="w-full py-6 bg-black text-white rounded-apple font-bold tracking-widest text-xs uppercase hover:bg-zinc-800 transition shadow-xl shadow-black/10">
                    Launch Wall Visualizer
                </button>
            </div>

            <div class="flex flex-col">
                <div class="flex items-center gap-4 mb-4">
                    <p class="text-zinc-400 text-xs font-bold tracking-[0.3em] uppercase">{{art.category}}</p>
                </div>
                <h2 v-reveal class="text-5xl md:text-6xl font-bold mb-8 tracking-tighter">{{art.title}}</h2>
                
                <div class="space-y-10">
                    <section v-reveal="{ delay: 0.1 }">
                        <h4 class="text-xs font-bold uppercase mb-4 text-zinc-400 tracking-widest">History of the Piece</h4>
                        <p class="text-xl leading-relaxed text-zinc-600">{{art.longHistory}}</p>
                    </section>

                    <p v-reveal="{ delay: 0.2 }" class="text-zinc-500 uppercase tracking-widest text-xs mb-8">{{art.artists?.name}}</p>
                    <section class="bg-zinc-900 text-white p-10 rounded-apple relative overflow-hidden group">
                        <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition duration-500"></div>
                        <h4 class="text-xs font-bold uppercase mb-6 opacity-50 tracking-widest">Artist's Inspiration</h4>
                        <p class="text-2xl font-light italic leading-snug">"{{art.inspirationText}}"</p>
                        <div class="mt-8 flex items-center gap-4">
                            <img :src="art.authorImg" class="w-12 h-12 rounded-full object-cover grayscale">
                            <p class="text-sm font-bold">{{art.artists?.name}}</p>
                        </div>
                    </section>

                    <section v-reveal="{ delay: 0.3 }" id="contact" class="pt-10 border-t border-zinc-100">
                        <div class="flex items-center justify-between flex-wrap gap-6">
                            <div>
                                <h4 class="text-xs font-bold uppercase mb-2 text-zinc-400 tracking-widest">Inquiries</h4>
                                <p class="text-sm text-zinc-500">Available for private acquisition.</p>
                            </div>
                            <a :href="'tel:0110952788'" class="px-8 py-4 border border-black rounded-full text-xs font-bold hover:bg-black hover:text-white transition uppercase tracking-widest">Enquire Now</a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
     </div>

     <!-- Visualizer Overlay -->
     <transition name="fade">
        <div v-if="showVisualizer" class="fixed inset-0 z-[100] bg-white p-6 md:p-10 flex flex-col items-center justify-center">
            <div class="wall-preview w-full max-w-6xl h-[60vh] md:h-[70vh] rounded-apple flex items-center justify-center relative shadow-inner overflow-hidden" :style="{ backgroundColor: wallColor }">
                <!-- Draggable Art -->
                <div @mousedown.prevent="onMouseDown"
                     :class="{'cursor-grabbing': isDragging, 'cursor-grab': !isDragging}"
                     class="touch-none shadow-[0_50px_100px_rgba(0,0,0,0.3)] transition-transform duration-75 relative z-10"
                     :style="{ transform: `translate(${position.x}px, ${position.y}px) scale(${scale})` }">
                    <img :src="art.image" class="h-[40vh] md:h-[50vh] pointer-events-none select-none" draggable="false">
                </div>
                
                <!-- Lighting effect -->
                <div class="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black/5 to-transparent pointer-events-none"></div>
                <!-- Spot light effect -->
                <div class="absolute top-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.8)_0%,transparent_50%)] opacity-30 pointer-events-none"></div>
                
                <!-- Instructions Overlay -->
                <div class="absolute bottom-6 left-6 text-[10px] uppercase font-bold text-zinc-400 tracking-widest pointer-events-none opacity-50">
                    Drag to move • Scroll to zoom
                </div>
            </div>
            
            <div class="mt-8 md:mt-12 text-center w-full max-w-md space-y-8">
                <!-- Color Controls -->
                <div>
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-zinc-400">Environment</p>
                    <div class="flex gap-4 md:gap-6 justify-center">
                        <button v-for="c in colors" :key="c" @click="wallColor = c" 
                                class="w-10 h-10 md:w-12 md:h-12 rounded-full border border-zinc-200 shadow-lg transition-transform hover:scale-110 active:scale-90" 
                                :style="{ backgroundColor: c }" :class="{'ring-2 ring-black ring-offset-2': wallColor === c}"></button>
                    </div>
                </div>

                <!-- Scale Slider -->
                <div class="w-full px-10">
                     <p class="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-zinc-400">Distance</p>
                     <input type="range" min="0.5" max="2" step="0.1" v-model.number="scale" class="w-full accent-black cursor-pointer">
                </div>

                <div class="pt-4 border-t border-zinc-100 w-full">
                    <button @click="exitVisualizer" class="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-zinc-600 hover:border-zinc-600 transition">Exit Visualizer</button>
                </div>
            </div>
        </div>
     </transition>
  </div>
  <div v-else class="min-h-screen flex flex-col items-center justify-center pt-20">
      <h3 class="text-xl font-bold mb-4">Artwork not found</h3>
      <button @click="router.push('/gallery')" class="text-sm underline">Back to Collection</button>
  </div>
</template>
