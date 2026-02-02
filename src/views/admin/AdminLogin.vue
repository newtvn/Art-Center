<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../../lib/supabaseClient'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const handleLogin = async () => {
    loading.value = true
    errorMsg.value = ''
    
    const { error } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
    })

    if (error) {
        errorMsg.value = error.message
        loading.value = false
    } else {
        router.push('/admin/dashboard')
    }
}
</script>

<template>
    <div class="min-h-screen flex flex-col items-center justify-center relative z-20 text-zinc-900 font-sans">
        <div class="w-full max-w-md p-8 md:p-12 bg-white/50 backdrop-blur-md rounded-3xl border border-zinc-200 shadow-2xl">
            <h1 class="text-sm font-bold uppercase tracking-[0.4em] mb-12 text-center border-b border-zinc-200 pb-6 text-zinc-400">The Curator's Ledger</h1>
            
            <form @submit.prevent="handleLogin" class="flex flex-col gap-8">
                <div class="group">
                    <label class="block text-xs uppercase tracking-widest mb-2 opacity-50 font-bold">Identity</label>
                    <input v-model="email" type="email" required 
                           class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-xl placeholder-zinc-300 focus:border-zinc-400 transition-colors"
                           placeholder="Enter your email">
                </div>

                <div class="group">
                    <label class="block text-xs uppercase tracking-widest mb-2 opacity-50 font-bold">Cipher</label>
                    <input v-model="password" type="password" required 
                           class="w-full bg-transparent border-b border-zinc-200 py-3 outline-none font-bold text-xl placeholder-zinc-300 focus:border-zinc-400 transition-colors"
                           placeholder="Enter your password">
                </div>

                <div v-if="errorMsg" class="text-xs text-red-500 font-bold uppercase tracking-wider text-center bg-red-50 py-3 rounded">
                    {{ errorMsg }}
                </div>

                <button type="submit" :disabled="loading" 
                        class="mt-6 bg-black text-white rounded-full py-5 text-xs uppercase font-bold tracking-[0.2em] hover:bg-zinc-800 transition-all disabled:opacity-50 shadow-lg hover:scale-105 active:scale-95">
                    {{ loading ? 'Authenticating...' : 'Access Ledger' }}
                </button>
            </form>

            <div class="mt-12 text-center">
                <p class="text-xs opacity-30 uppercase tracking-[0.3em] font-bold">Authorized Personnel Only</p>
            </div>
        </div>
    </div>
</template>
