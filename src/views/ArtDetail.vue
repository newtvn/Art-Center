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
const wallColor = ref('#f4f4f5') // Deprecated but kept to avoid immediate ref errors if template lag
const rooms = [
    { name: 'Minimal', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=2000', thumb: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=200' },
    { name: 'Loft', url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=2000', thumb: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=200' },
    { name: 'Atelier', url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?q=80&w=2000', thumb: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a6?q=80&w=200' },
    { name: 'Living', url: 'https://images.unsplash.com/photo-1628156158097-f58c73445037?q=80&w=2000', thumb: 'https://images.unsplash.com/photo-1628156158097-f58c73445037?q=80&w=200' }
]
const currentRoom = ref(rooms[1])

const frames = [
    { name: 'Float', class: 'p-0 border-none', matteClass: '' },
    { name: 'Gallery', class: 'bg-zinc-950 p-[12px] shadow-2xl', matteClass: 'bg-white p-[8%] border border-zinc-200' },
    { name: 'Oak', class: 'bg-[#8B5E3C] p-[16px] shadow-2xl rounded-sm', matteClass: 'bg-[#FDFBF7] p-[10%] shadow-inner' },
    { name: 'Sleek', class: 'bg-zinc-950 p-[2px]', matteClass: 'border-4 border-white' } // Thin frame
]
const frameStyle = ref(frames[1])

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
        <div v-if="showVisualizer" class="fixed inset-0 z-[100] bg-[#EAE8E1]/95 p-0 md:p-10 flex flex-col items-center justify-center backdrop-blur-md">
            
            <!-- Room Viewport -->
            <div class="wall-preview w-full h-full md:max-w-7xl md:h-[75vh] md:rounded-3xl flex items-center justify-center relative shadow-2xl overflow-hidden transition-all duration-700 ease-in-out border border-zinc-200" 
                 :style="{ 
                    backgroundImage: `url(${currentRoom.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                 }">
                
                <!-- Draggable Art -->
                <div @mousedown.prevent="onMouseDown"
                     :class="[
                        {'cursor-grabbing': isDragging, 'cursor-grab': !isDragging}, 
                        frameStyle.class
                     ]"
                     class="touch-none relative z-10 transition-transform duration-75 select-none origin-center bg-white"
                     :style="{ 
                        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                        boxShadow: '0 20px 50px -10px rgba(0,0,0,0.5), 0 10px 20px -10px rgba(0,0,0,0.4)' 
                     }">
                     
                    <!-- Inner Matte/Frame Structure -->
                    <div class="w-full h-full" :class="frameStyle.matteClass">
                        <img :src="art.image" class="h-[25vh] md:h-[40vh] w-auto pointer-events-none block" draggable="false">
                    </div>
                </div>
                
                <!-- Room Vibes/Overlays -->
                <div class="absolute inset-0 pointer-events-none bg-black/5 mix-blend-multiply"></div>
                <div class="absolute top-0 w-full h-[150%] bg-gradient-to-b from-black/20 via-transparent to-black/10 pointer-events-none opacity-40 mix-blend-overlay"></div>
                
                <!-- Instructions -->
                <div class="absolute top-8 left-8 text-[10px] uppercase font-bold text-white tracking-[0.3em] pointer-events-none border border-white/20 px-4 py-2 rounded-full backdrop-blur-md bg-black/10">
                    Click & Drag to Position
                </div>
            </div>
            
            <!-- Controls Bar -->
            <div class="mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/50 shadow-xl">
                
                <!-- Room Selection -->
                <div class="flex flex-col items-center md:items-start">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-zinc-400">Environment</p>
                    <div class="flex gap-3">
                        <button v-for="room in rooms" :key="room.name" @click="currentRoom = room" 
                                class="w-12 h-12 rounded-xl border-2 transition-all bg-cover bg-center hover:scale-110 shadow-lg relative overflow-hidden" 
                                :class="currentRoom.name === room.name ? 'border-black scale-110' : 'border-transparent opacity-50 hover:opacity-100'"
                                :style="{ backgroundImage: `url(${room.thumb})` }">
                        </button>
                    </div>
                </div>

                <!-- Frame Selection -->
                <div class="flex flex-col items-center">
                    <p class="text-[10px] font-bold uppercase tracking-[0.3em] mb-4 text-zinc-400">Framing</p>
                    <div class="flex gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200">
                        <button v-for="style in frames" :key="style.name" @click="frameStyle = style"
                                class="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                                :class="frameStyle.name === style.name ? 'bg-black text-white shadow-lg' : 'text-zinc-400 hover:text-black'">
                            {{ style.name }}
                        </button>
                    </div>
                </div>

                <!-- Scale & Exit -->
                <div class="flex flex-col md:flex-row items-center gap-6 justify-end">
                     <div class="w-32">
                         <p class="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 text-zinc-400 text-center md:text-left">Distance</p>
                         <input type="range" min="0.5" max="1.5" step="0.05" v-model.number="scale" class="w-full h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-black">
                     </div>
                     <button @click="exitVisualizer" class="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-zinc-800 transition shadow-lg shrink-0">
                         &times;
                     </button>
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
