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
    <div class="min-h-screen p-6 md:p-12 font-mono text-zinc-900 relative z-20">
        <!-- Header -->
        <header class="flex justify-between items-end mb-12 border-b border-black pb-4">
            <div>
                <h1 class="text-xs font-bold uppercase tracking-[0.4em] mb-2">Persona Editor</h1>
                <p class="text-[10px] opacity-60">Define how the world perceives the curator.</p>
            </div>
            <button @click="router.push('/admin/dashboard')" class="text-[10px] uppercase font-bold hover:underline">Back to Ledger</button>
        </header>

        <div v-if="loading" class="opacity-50 text-xs">Retrieving dossier...</div>

        <div v-else class="max-w-2xl mx-auto">
            <!-- Profile Photo -->
            <div class="mb-12 flex flex-col items-center">
                <div class="w-32 h-40 bg-zinc-200 border border-black mb-4 relative overflow-hidden group cursor-pointer">
                    <img v-if="photoPreview" :src="photoPreview" class="w-full h-full object-cover grayscale group-hover:grayscale-0 transition">
                    <div v-else class="w-full h-full flex items-center justify-center opacity-30 text-xs">NO IMG</div>
                    
                    <input type="file" @change="handlePhotoSelect" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10" />
                </div>
                <p class="text-[10px] uppercase tracking-widest opacity-60">Profile Portrait</p>
            </div>

            <div class="space-y-8">
                <div class="group">
                    <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Full Name</label>
                    <input v-model="profile.name" type="text" class="w-full bg-transparent border-b border-black py-2 outline-none font-bold text-lg placeholder-black/20 focus:border-black transition-colors" placeholder="E.g. Elias Thorne">
                </div>

                <div class="group">
                    <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Artistic Specialty</label>
                    <input v-model="profile.specialty" type="text" class="w-full bg-transparent border-b border-black py-2 outline-none font-bold text-sm placeholder-black/20 focus:border-black transition-colors" placeholder="E.g. Brutalist Sculpture">
                </div>

                <div class="group">
                    <label class="block text-[10px] uppercase tracking-widest mb-2 opacity-60">Biography</label>
                    <textarea v-model="profile.long_bio" rows="6" class="w-full bg-transparent border border-black p-4 outline-none text-sm placeholder-black/20 focus:bg-black/5 transition-colors resize-none" placeholder="Write your manifesto..."></textarea>
                </div>

                <div class="grid grid-cols-2 gap-8">
                    <div class="group">
                        <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Instagram URL</label>
                        <input v-model="profile.socials.instagram" type="url" class="w-full bg-transparent border-b border-black py-2 outline-none text-xs placeholder-black/20 focus:border-black transition-colors" placeholder="https://instagram.com/...">
                    </div>
                    <div class="group">
                        <label class="block text-[10px] uppercase tracking-widest mb-1 opacity-60">Website URL</label>
                        <input v-model="profile.socials.website" type="url" class="w-full bg-transparent border-b border-black py-2 outline-none text-xs placeholder-black/20 focus:border-black transition-colors" placeholder="https://...">
                    </div>
                </div>

                <div class="pt-8 flex justify-end">
                    <button @click="saveProfile" :disabled="saving" class="bg-black text-[#E8E4D9] px-8 py-3 text-[10px] uppercase font-bold tracking-widest hover:opacity-80 disabled:opacity-50">
                        {{ saving ? 'Updating Records...' : 'Save Persona' }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
