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
    <div class="min-h-screen flex flex-col items-center justify-center relative z-20 text-zinc-900 font-mono">
        <div class="w-full max-w-md p-8">
            <h1 class="text-xs font-bold uppercase tracking-[0.4em] mb-12 text-center border-b border-black pb-4">The Curator's Ledger</h1>
            
            <form @submit.prevent="handleLogin" class="flex flex-col gap-8">
                <div class="group">
                    <label class="block text-[10px] uppercase tracking-widest mb-2 opacity-60">Identity</label>
                    <input v-model="email" type="email" required 
                           class="w-full bg-transparent border-b border-black py-2 outline-none font-bold text-lg placeholder-zinc-400 focus:border-zinc-500 transition-colors"
                           placeholder="Enter your email">
                </div>

                <div class="group">
                    <label class="block text-[10px] uppercase tracking-widest mb-2 opacity-60">Cipher</label>
                    <input v-model="password" type="password" required 
                           class="w-full bg-transparent border-b border-black py-2 outline-none font-bold text-lg placeholder-zinc-400 focus:border-zinc-500 transition-colors"
                           placeholder="Enter your password">
                </div>

                <div v-if="errorMsg" class="text-xs text-red-600 font-bold uppercase tracking-wider text-center">
                    {{ errorMsg }}
                </div>

                <button type="submit" :disabled="loading" 
                        class="mt-8 border border-black py-4 px-8 text-xs font-bold uppercase tracking-[0.2em] hover:bg-black hover:text-[#E8E4D9] transition-all disabled:opacity-50">
                    {{ loading ? 'Authenticating...' : 'Access Ledger' }}
                </button>
            </form>

            <div class="mt-12 text-center">
                <p class="text-[10px] opacity-40 uppercase tracking-widest">Authorized Personnel Only</p>
            </div>
        </div>
    </div>
</template>
