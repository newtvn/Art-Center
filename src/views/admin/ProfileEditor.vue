<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'

const router = useRouter()
const user = ref(null)
const loading = ref(true)
const saving = ref(false)

const profile = ref({
    name: '',
    specialty: '',
    long_bio: '',
    photo: '', // URL
    socials: {
        instagram: '',
        website: ''
    }
})

const photoPreview = ref(null)

onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        router.push('/admin/login')
        return
    }
    user.value = session.user
    fetchProfile()
})

const fetchProfile = async () => {
    // Assuming 1:1 relationship between auth user and artist profile for now
    // In a real app, we might query by artist_id stored in user metadata, or just match IDs if we forced them to be same
    // For this demo, let's try to find an artist record that matches a potential 'id' or just fetch the first one associated
    
    // Strategy: We'll assume the artist table ID matches the Auth User ID (requires manual insert or trigger, 
    // BUT for simplicity in this "CMS", let's query where id matches, or create if missing)
    
    let { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', user.value.id)
        .single()

    if (data) {
        profile.value = data
        if (!profile.value.socials) profile.value.socials = { instagram: '', website: '' } // ensure structure
        if (data.photo) photoPreview.value = data.photo
    }
    loading.value = false
}

const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    // Local preview
    photoPreview.value = URL.createObjectURL(file)
    
    // Store file for upload on save
    profile.value._newPhotoFile = file
}

const saveProfile = async () => {
    saving.value = true
    
    // 1. Upload Photo if changed
    if (profile.value._newPhotoFile) {
        const file = profile.value._newPhotoFile
        const fileExt = file.name.split('.').pop()
        const filePath = `avatars/${user.value.id}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
            .from('art-center-assets')
            .upload(filePath, file, { upsert: true })
            
        if (!uploadError) {
             const { data: { publicUrl } } = supabase.storage
                .from('art-center-assets')
                .getPublicUrl(filePath)
            profile.value.photo = publicUrl
        }
    }

    // 2. Upsert Profile
    const updates = {
        id: user.value.id, // Explicitly linking Auth ID to Artist ID
        name: profile.value.name,
        specialty: profile.value.specialty,
        long_bio: profile.value.long_bio,
        photo: profile.value.photo,
        socials: profile.value.socials
    }

    const { error } = await supabase
        .from('artists')
        .upsert(updates)

    if (error) {
        console.error('Error saving profile:', error)
        alert('Failed to save profile')
    } else {
        // success
        router.push('/admin/dashboard')
    }
    saving.value = false
}
</script>

<template>
    <div class="min-h-screen p-6 md:p-12 font-sans text-zinc-900 relative z-20">
        <!-- Header -->
        <header class="flex justify-between items-end mb-16 md:mb-24 border-b border-zinc-200 pb-6">
            <div>
                <h1 class="text-sm font-bold uppercase tracking-[0.4em] mb-2">Persona Editor</h1>
                <p class="text-xs uppercase tracking-widest text-zinc-400">Define how the world perceives the curator.</p>
            </div>
            <button @click="router.push('/admin/dashboard')" class="text-xs uppercase font-bold tracking-widest hover:text-zinc-500 transition">Back to Ledger</button>
        </header>

        <div v-if="loading" class="opacity-50 text-sm font-bold uppercase tracking-widest text-center">Retrieving dossier...</div>

        <div v-else class="max-w-3xl mx-auto">
            <!-- Profile Photo -->
            <div class="mb-16 flex flex-col items-center">
                <div class="w-48 h-48 md:w-64 md:h-64 bg-zinc-50 border border-zinc-100 rounded-apple overflow-hidden group cursor-pointer shadow-2xl relative transition hover:scale-105 duration-500">
                    <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-700">
                    <div v-else class="w-full h-full flex flex-col items-center justify-center opacity-30 text-xs font-bold uppercase tracking-widest">
                        <span>Upload</span>
                        <span>Portrait</span>
                    </div>
                    
                    <input type="file" @change="handlePhotoSelect" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                </div>
                <p class="mt-8 text-xs uppercase tracking-[0.2em] font-bold opacity-40">Click to Update</p>
            </div>

            <div class="space-y-12">
                <div class="group">
                    <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Full Name</label>
                    <input v-model="profile.name" type="text" class="w-full bg-transparent border-b border-zinc-200 py-4 outline-none font-bold text-4xl md:text-6xl placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="Elas Thorne">
                </div>

                <div class="group">
                    <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Artistic Specialty</label>
                    <input v-model="profile.specialty" type="text" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-medium text-2xl placeholder-zinc-200 focus:border-zinc-400 transition-colors text-zinc-600" placeholder="Brutalist Sculpture">
                </div>

                <div class="group">
                    <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Biography</label>
                    <textarea v-model="profile.long_bio" rows="8" class="w-full bg-transparent border-b border-zinc-200 py-4 outline-none text-xl md:text-2xl font-light leading-relaxed placeholder-zinc-200 focus:border-zinc-400 transition-colors resize-none" placeholder="Write your manifesto..."></textarea>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div class="group">
                        <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Instagram URL</label>
                        <input v-model="profile.socials.instagram" type="url" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none text-base font-medium placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="https://instagram.com/...">
                    </div>
                    <div class="group">
                        <label class="block text-xs uppercase tracking-widest mb-3 text-zinc-400 font-bold">Website URL</label>
                        <input v-model="profile.socials.website" type="url" class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none text-base font-medium placeholder-zinc-200 focus:border-zinc-400 transition-colors" placeholder="https://...">
                    </div>
                </div>

                <div class="pt-16 flex justify-center md:justify-end">
                    <button @click="saveProfile" :disabled="saving" class="bg-black text-white px-12 py-6 rounded-full text-xs uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-xl hover:scale-105">
                        {{ saving ? 'Updating Records...' : 'Save Persona' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
