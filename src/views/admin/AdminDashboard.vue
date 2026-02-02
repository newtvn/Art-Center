<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'

const router = useRouter()
const user = ref(null)
const loading = ref(true)

const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
}

onMounted(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
        router.push('/admin/login')
    } else {
        user.value = session.user
    }
    loading.value = false
})
</script>

<template>
    <div v-if="loading" class="min-h-screen flex items-center justify-center font-sans font-bold text-xs uppercase tracking-widest text-zinc-500">
        Loading Ledger...
    </div>
    <div v-else class="min-h-screen p-6 md:p-12 font-sans text-zinc-900 relative z-20">
        <header class="flex justify-between items-end mb-20 border-b border-zinc-200 pb-6">
            <div>
                <h1 class="text-xs font-bold uppercase tracking-[0.4em] mb-2">The Curator's Ledger</h1>
                <p class="text-[10px] uppercase tracking-widest text-zinc-400">Logged in as {{ user?.email }}</p>
            </div>
            <button @click="signOut" class="text-[10px] uppercase font-bold tracking-widest hover:text-zinc-500 transition">Close Ledger</button>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Profile Section -->
            <div class="border border-zinc-200 p-8 rounded-3xl hover:shadow-xl transition duration-500 bg-white/50 backdrop-blur-md">
                <h2 class="text-xs font-bold uppercase tracking-widest mb-8">Artist Profile</h2>
                <p class="text-[10px] text-zinc-500 mb-6 leading-relaxed">Manage your public persona. This data reflects on your Curators page.</p>
                <div class="h-40 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 border border-zinc-100">
                    <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-300">Profile Data Plugin</span>
                </div>
                <button @click="router.push('/admin/profile')" class="w-full bg-black text-white py-4 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 transition shadow-lg">Edit Profile</button>
            </div>

            <!-- Artworks Section -->
            <div class="border border-zinc-200 p-8 rounded-3xl hover:shadow-xl transition duration-500 bg-white/50 backdrop-blur-md">
                <h2 class="text-xs font-bold uppercase tracking-widest mb-8">Collection Registry</h2>
                <p class="text-[10px] text-zinc-500 mb-6 leading-relaxed">Draft, archive, and manage Exhibition pieces for the gallery.</p>
                <div class="h-40 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 border border-zinc-100">
                     <span class="text-[10px] uppercase font-bold tracking-widest text-zinc-300">Inventory List Plugin</span>
                </div>
                <button @click="router.push('/admin/artworks')" class="w-full bg-black text-white py-4 rounded-full text-[10px] uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 transition shadow-lg">Manage Artworks</button>
            </div>
        </section>
    </div>
</template>
