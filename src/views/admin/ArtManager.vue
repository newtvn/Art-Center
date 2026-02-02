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
    <div class="min-h-screen p-6 md:p-12 font-mono text-zinc-900 relative z-20">
        <!-- Header -->
        <header class="flex justify-between items-end mb-12 border-b border-black pb-4">
            <div>
                <h1 class="text-xs font-bold uppercase tracking-[0.4em] mb-2">Inventory Registry</h1>
                <p class="text-[10px] opacity-60">Archive and manage exhibition pieces</p>
            </div>
            <button @click="router.push('/admin/dashboard')" class="text-[10px] uppercase font-bold hover:underline">Back to Ledger</button>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Sidebar: List -->
            <div class="lg:col-span-1 border-r border-black pr-12 min-h-[50vh]">
                <div class="flex justify-between items-center mb-8">
                    <h2 class="text-xs font-bold uppercase tracking-widest">Cataloged Works</h2>
                    <button @click="isEditing = true" class="text-[10px] bg-black text-[#E8E4D9] px-3 py-1 uppercase hover:opacity-80">+ New Entry</button>
                </div>
                
                <div v-if="loading" class="text-[10px] opacity-50">Scanning archives...</div>
                
                <ul v-else class="space-y-4">
                    <li v-for="art in artworks" :key="art.id" class="group cursor-pointer hover:bg-black/5 p-2 -mx-2 transition">
                        <div class="flex justify-between items-baseline">
                            <span class="font-bold text-sm">{{ art.title }}</span>
                            <span class="text-[10px] opacity-50">{{ art.year }}</span>
                        </div>
                        <div class="text-[10px] opacity-70 mt-1 flex justify-between">
                            <span>{{ art.category }}</span>
                            <span>${{ art.price }}</span>
                        </div>
                    </li>
                    <li v-if="artworks.length === 0" class="text-[10px] opacity-40 italic">No works found in the ledger.</li>
                </ul>
            </div>

            <!-- Main: Editor -->
            <div class="lg:col-span-2 pl-0 lg:pl-12">
                <div v-if="isEditing" class="max-w-xl">
                    <h2 class="text-xs font-bold uppercase tracking-widest mb-8 border-b border-black/20 pb-2">New Entry Form</h2>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <!-- Image Upload -->
                        <div class="aspect-[3/4] border-2 border-dashed border-black/30 flex flex-col items-center justify-center relative hover:bg-black/5 transition cursor-pointer group">
                            <input type="file" @change="handleImageSelect" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                            <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover p-2 pointer-events-none" />
                            <div v-else class="text-center p-4">
                                <span class="text-2xl mb-2 block group-hover:scale-110 transition">+</span>
                                <span class="text-[10px] uppercase font-bold tracking-widest">Attach Visual</span>
                            </div>
                        </div>

                        <!-- Data Fields -->
                        <div class="flex flex-col gap-6">
                            <div class="group">
                                <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Title</label>
                                <input v-model="newArt.title" type="text" class="w-full bg-transparent border-b border-black py-1 outline-none font-bold text-sm placeholder-black/20 focus:border-black transition-colors" placeholder="Untitled No. 5">
                            </div>
                            
                            <div class="group">
                                <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Creation Year</label>
                                <input v-model="newArt.year" type="text" class="w-full bg-transparent border-b border-black py-1 outline-none font-bold text-sm placeholder-black/20 focus:border-black transition-colors" placeholder="2026">
                            </div>

                            <div class="group">
                                <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Category</label>
                                <select v-model="newArt.category" class="w-full bg-transparent border-b border-black py-1 outline-none font-bold text-sm text-zinc-900">
                                    <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
                                </select>
                            </div>

                            <div class="flex gap-4">
                                <div class="group w-1/2">
                                    <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Value (USD)</label>
                                    <input v-model="newArt.price" type="number" class="w-full bg-transparent border-b border-black py-1 outline-none font-bold text-sm placeholder-black/20 focus:border-black transition-colors" placeholder="4500">
                                </div>
                                <div class="group w-1/2">
                                    <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Dimensions</label>
                                    <input v-model="newArt.dimensions" type="text" class="w-full bg-transparent border-b border-black py-1 outline-none font-bold text-sm placeholder-black/20 focus:border-black transition-colors" placeholder="40x60cm">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-end gap-4 mt-12 border-t border-black pt-6">
                        <button @click="isEditing = false" class="text-[10px] uppercase font-bold hover:opacity-60 px-4 py-2">Discard</button>
                        <button @click="uploadArt" :disabled="uploading" class="bg-black text-[#E8E4D9] px-6 py-2 text-[10px] uppercase font-bold tracking-widest hover:opacity-80 disabled:opacity-50">
                            {{ uploading ? 'Archiving...' : 'Stamp & Save' }}
                        </button>
                    </div>
                </div>

                <div v-else class="h-full flex flex-col items-center justify-center opacity-40 min-h-[40vh]">
                    <p class="text-[10px] uppercase tracking-widest mb-2">Registry Closed</p>
                    <p class="text-[10px]">Select "New Entry" to open the ledger.</p>
                </div>
            </div>
        </div>
    </div>
</template>
