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
    <div v-if="loading" class="min-h-screen flex items-center justify-center font-mono text-xs uppercase tracking-widest">
        Loading Ledger...
    </div>
    <div v-else class="min-h-screen p-6 md:p-12 font-mono text-zinc-900 relative z-20">
        <header class="flex justify-between items-end mb-20 border-b border-black pb-4">
            <div>
                <h1 class="text-xs font-bold uppercase tracking-[0.4em] mb-2">The Curator's Ledger</h1>
                <p class="text-[10px] opacity-60">Logged in as {{ user?.email }}</p>
            </div>
            <button @click="signOut" class="text-[10px] uppercase font-bold hover:underline">Close Ledger</button>
        </header>

        <section class="grid grid-cols-1 md:grid-cols-2 gap-12">
            <!-- Profile Section -->
            <div class="border border-black p-8">
                <h2 class="text-xs font-bold uppercase tracking-widest mb-8">Artist Profile</h2>
                <p class="text-[10px] opacity-60 mb-4">Manage your public persona.</p>
                <div class="h-40 bg-black/5 flex items-center justify-center mb-4">
                    <span class="text-[10px] opacity-40">Profile Data Plugin</span>
                </div>
                <button class="w-full border border-black py-3 text-[10px] uppercase font-bold hover:bg-black hover:text-[#E8E4D9]">Edit Profile</button>
            </div>

            <!-- Artworks Section -->
            <div class="border border-black p-8">
                <h2 class="text-xs font-bold uppercase tracking-widest mb-8">Collection Registry</h2>
                <p class="text-[10px] opacity-60 mb-4">Draft, archive, and exhibited works.</p>
                <div class="h-40 bg-black/5 flex items-center justify-center mb-4">
                     <span class="text-[10px] opacity-40">Inventory List Plugin</span>
                </div>
                <button class="w-full border border-black py-3 text-[10px] uppercase font-bold hover:bg-black hover:text-[#E8E4D9]">Manage Artworks</button>
            </div>
        </section>
    </div>
</template>
