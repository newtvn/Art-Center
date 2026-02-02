<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'

const router = useRouter()
const user = ref(null)
const loading = ref(true)
const profile = ref(null)
const artCount = ref(0)
const checkingProfile = ref(true)

onMounted(async () => {
    // 1. Check User
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        router.push('/admin/login')
        return
    }
    user.value = session.user

    // 2. Fetch Profile to see if it exists (assuming 1:1 map for simplicity, or select first)
    // First, try matching auth ID if we linked them correctly (or just fetch ANY for now if generic admin)
    // Actually, in our seeded data we used random UUIDs, so we can't match Auth ID easily unless user edited it.
    // For this demo, let's just fetch the FIRST artist or one that matches a known email if we had that column.
    // Let's just fetch the *count* of artists to see if database has data?
    // User requested "If artist profile is present preview it".
    // Let's try to fetch an artist profile by the user's ID (if they created one via RLS).
    
    // Attempt fetch by Auth ID (ideal state)
    let { data: myProfile } = await supabase.from('artists').select('*').eq('id', user.value.id).single()
    
    // Fallback: If no profile found by Auth ID, maybe just fetch the first one to "Preview" functionality 
    // (Since user might be using the seed data which they don't 'own' yet).
    if (!myProfile) {
         const { data: firstProfile } = await supabase.from('artists').select('*').limit(1).single()
         if (firstProfile) myProfile = firstProfile // Show *A* profile for demo purposes if mapped one missing
    }
    
    profile.value = myProfile
    
    // 3. Fetch Artwork Count
    const { count } = await supabase.from('artworks').select('*', { count: 'exact', head: true })
    artCount.value = count || 0

    loading.value = false
})

const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
}
</script>

<template>
    <div v-if="loading" class="min-h-screen flex items-center justify-center font-sans font-bold text-sm uppercase tracking-widest text-zinc-500">
        Loading Ledger...
    </div>
    <div v-else class="min-h-screen p-6 md:p-12 font-sans text-zinc-900 relative z-20">
        <header class="flex justify-between items-end mb-20 border-b border-zinc-200 pb-6">
            <div>
                <h1 class="text-sm font-bold uppercase tracking-[0.4em] mb-2">The Curator's Ledger</h1>
                <p class="text-xs uppercase tracking-widest text-zinc-400">Logged in as {{ user?.email }}</p>
            </div>
            <button @click="signOut" class="text-xs uppercase font-bold tracking-widest hover:text-zinc-500 transition">Close Ledger</button>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Profile Section -->
            <div class="border border-zinc-200 p-8 rounded-3xl hover:shadow-xl transition duration-500 bg-white/50 backdrop-blur-md flex flex-col justify-between group">
                <div>
                    <h2 class="text-sm font-bold uppercase tracking-widest mb-8 text-zinc-400">Artist Profile</h2>
                    <div v-if="profile" class="flex items-center gap-6 mb-8">
                        <img :src="profile.photo || 'https://via.placeholder.com/150'" class="w-24 h-24 rounded-apple object-cover grayscale group-hover:grayscale-0 transition duration-500 shadow-lg">
                        <div>
                            <h3 class="text-3xl font-bold mb-2">{{ profile.name }}</h3>
                            <p class="text-xs uppercase tracking-widest text-zinc-500">{{ profile.specialty }}</p>
                        </div>
                    </div>
                    <div v-else class="h-24 flex items-center mb-8 opacity-50">
                        <p class="text-base font-bold text-zinc-400">No profile active.</p>
                    </div>
                    <p class="text-xs text-zinc-400 mb-6 leading-relaxed">Manage your public persona. This data reflects on your Curators page.</p>
                </div>
                <button @click="router.push('/admin/profile')" class="w-full bg-black text-white py-5 rounded-full text-xs uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 transition shadow-lg group-hover:scale-[1.02]">Edit Profile</button>
            </div>

            <!-- Artworks Section -->
            <div class="border border-zinc-200 p-8 rounded-3xl hover:shadow-xl transition duration-500 bg-white/50 backdrop-blur-md flex flex-col justify-between group">
                <div>
                    <h2 class="text-sm font-bold uppercase tracking-widest mb-8 text-zinc-400">Collection Registry</h2>
                    <div class="h-24 flex items-center gap-6 mb-8">
                         <span class="text-6xl font-bold tracking-tighter">{{ artCount }}</span>
                         <span class="text-xs uppercase font-bold tracking-widest text-zinc-400 mt-2 block">Works<br>Cataloged</span>
                    </div>
                    <p class="text-xs text-zinc-400 mb-6 leading-relaxed">Draft, archive, and manage Exhibition pieces for the gallery.</p>
                </div>
                <button @click="router.push('/admin/artworks')" class="w-full bg-black text-white py-5 rounded-full text-xs uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 transition shadow-lg group-hover:scale-[1.02]">Manage Artworks</button>
            </div>
        </section>
    </div>
</template>
