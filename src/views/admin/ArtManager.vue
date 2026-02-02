<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'

const router = useRouter()
const artworks = ref([])
const loading = ref(true)
const user = ref(null)

// Form State
const isEditing = ref(false)
const newArt = ref({
    title: '',
    year: '',
    category: 'Sculpture',
    price: '',
    dimensions: '',
    image: null
})
const imagePreview = ref(null)
const uploading = ref(false)

const categories = ['Sculpture', 'Mixed Media', 'Digital', 'Painting', 'Installation']

onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        router.push('/admin/login')
        return
    }
    user.value = session.user
    fetchArtworks()
})

const fetchArtworks = async () => {
    // In a real scenario, we'd filter by artist_id matching the user's connected artist profile
    // For now, we fetch all to demonstrate
    const { data, error } = await supabase.from('artworks').select('*')
    if (data) artworks.value = data
    loading.value = false
}

const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    newArt.value.image = file
    imagePreview.value = URL.createObjectURL(file)
}

const uploadArt = async () => {
    if (!newArt.value.image || !newArt.value.title) return
    
    uploading.value = true
    const file = newArt.value.image
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${user.value.id}/${fileName}`

    // 1. Upload Image
    const { error: uploadError } = await supabase.storage
        .from('art-center-assets')
        .upload(filePath, file)

    if (uploadError) {
        console.error('Upload failed:', uploadError)
        uploading.value = false
        return
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('art-center-assets')
        .getPublicUrl(filePath)

    // 3. Insert Record
    const { error: insertError } = await supabase
        .from('artworks')
        .insert({
            artist_id: user.value.id, // Assuming the auth user ID links to this
            title: newArt.value.title,
            year: newArt.value.year,
            category: newArt.value.category,
            price: newArt.value.price,
            dimensions: newArt.value.dimensions,
            image: publicUrl
        })

    if (insertError) {
        console.error('Insert failed:', insertError)
    } else {
        // Reset and Refresh
        isEditing.value = false
        newArt.value = { title: '', year: '', category: 'Sculpture', price: '', dimensions: '', image: null }
        imagePreview.value = null
        fetchArtworks()
    }
    uploading.value = false
}
</script>

<template>
    <div class="min-h-screen p-6 md:p-12 font-sans text-zinc-900 relative z-20">
        <!-- Header -->
        <header class="flex justify-between items-end mb-12 border-b border-zinc-200 pb-6">
            <div>
                <h1 class="text-sm font-bold uppercase tracking-[0.4em] mb-2">Inventory Registry</h1>
                <p class="text-xs uppercase tracking-widest text-zinc-400">Archive and manage exhibition pieces</p>
            </div>
            <button @click="router.push('/admin/dashboard')" class="text-xs uppercase font-bold tracking-widest hover:text-zinc-500 transition">Back to Ledger</button>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-24">
            <!-- Sidebar: List -->
            <div class="lg:col-span-1 border-r border-zinc-200 pr-12 min-h-[50vh]">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-sm font-bold uppercase tracking-widest">Cataloged Works</h2>
                    <button @click="isEditing = true" class="text-xs bg-black text-white px-5 py-3 rounded-full uppercase font-bold tracking-wider hover:bg-zinc-800 transition shadow-lg">+ New Entry</button>
                </div>
                
                <div v-if="loading" class="text-xs opacity-50 font-bold uppercase tracking-widest text-center mt-10">Scanning archives...</div>
                
                <ul v-else class="space-y-4">
                    <li v-for="art in artworks" :key="art.id" 
                        class="group cursor-pointer hover:bg-zinc-50 p-6 -mx-6 rounded-xl transition duration-300 flex gap-6 items-center">
                        <img :src="art.image" class="w-16 h-16 rounded-xl object-cover grayscale group-hover:grayscale-0 transition duration-300 bg-zinc-100 shadow-sm">
                        <div class="flex-1">
                            <div class="flex justify-between items-baseline mb-2">
                                <span class="font-bold text-base">{{ art.title }}</span>
                                <span class="text-xs text-zinc-400 font-bold">{{ art.year }}</span>
                            </div>
                            <div class="text-xs text-zinc-500 flex justify-between">
                                <span class="uppercase tracking-wider">{{ art.category }}</span>
                                <span class="font-bold">${{ art.price }}</span>
                            </div>
                        </div>
                    </li>
                    <li v-if="artworks.length === 0" class="text-xs opacity-40 italic text-center py-10">No works found in the ledger.</li>
                </ul>
            </div>

            <!-- Main: Editor -->
            <div class="lg:col-span-2 pl-0 lg:pl-12">
                <div v-if="isEditing" class="max-w-2xl">
                    <h2 class="text-sm font-bold uppercase tracking-widest mb-10 text-zinc-400">New Entry Form</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
                        <!-- Image Upload -->
                        <div class="aspect-[3/4] bg-zinc-50 border border-zinc-100 rounded-apple flex flex-col items-center justify-center relative hover:scale-[1.02] transition duration-500 cursor-pointer group shadow-xl overflow-hidden">
                            <input type="file" @change="handleImageSelect" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                            <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                            <div v-else class="text-center p-4 opacity-40 group-hover:opacity-100 transition">
                                <span class="text-6xl mb-4 block font-light">+</span>
                                <span class="text-xs uppercase font-bold tracking-widest">Attach Visual</span>
                            </div>
                        </div>

                        <!-- Data Fields -->
                        <div class="flex flex-col gap-8">
                            <div class="group">
                                <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Title</label>
                                <input v-model="newArt.title" type="text" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-2xl placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="Untitled No. 5">
                            </div>
                            
                            <div class="group">
                                <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Creation Year</label>
                                <input v-model="newArt.year" type="text" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-lg placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="2026">
                            </div>

                            <div class="group">
                                <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Category</label>
                                <select v-model="newArt.category" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-lg text-zinc-900 cursor-pointer">
                                    <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                                </select>
                            </div>

                            <div class="flex gap-8">
                                <div class="group w-1/2">
                                    <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Value (USD)</label>
                                    <input v-model="newArt.price" type="number" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-lg placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="4500">
                                </div>
                                <div class="group w-1/2">
                                    <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Dimensions</label>
                                    <input v-model="newArt.dimensions" type="text" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-lg placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="40x60cm">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-8 mt-16 border-t border-zinc-100 pt-10">
                        <button @click="isEditing = false" class="text-xs uppercase font-bold text-zinc-400 hover:text-red-500 px-6 py-3 transition">Discard</button>
                        <button @click="uploadArt" :disabled="uploading" class="bg-black text-white px-10 py-5 rounded-full text-xs uppercase font-bold tracking-widest hover:bg-zinc-800 disabled:opacity-50 shadow-lg hover:scale-105 transition-all">
                            {{ uploading ? 'Archiving...' : 'Stamp & Save' }}
                        </button>
                    </div>
                </div>

                <div v-else class="h-full flex flex-col items-center justify-center opacity-30 min-h-[50vh]">
                    <p class="text-sm uppercase tracking-widest mb-6 font-bold">Registry Closed</p>
                    <p class="text-xs">Select "New Entry" on the left to open the ledger.</p>
                </div>
            </div>
        </div>
    </div>
</template>
