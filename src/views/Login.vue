<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../composables/useAuth'
import { safeReturnPath } from '../lib/auctions'
import PaintLoader from '../components/PaintLoader.vue'
const route=useRoute(), router=useRouter(), {user}=useAuth()
const email=ref(''), busy=ref(false), sent=ref(false), error=ref('')
const destination=computed(()=>safeReturnPath(route.query.next))
watch(user, value=>{if(value) router.replace(destination.value)}, {immediate:true})
onMounted(()=>{if(new URLSearchParams(window.location.hash.slice(1)).has('error')) {error.value='This sign-in link has expired or is invalid. Request a fresh link below.';window.history.replaceState(null,'',window.location.pathname+window.location.search)}})
async function signIn() {
 if(busy.value) return
 busy.value=true; error.value=''
 try {
  const callback = new URL('/login', window.location.origin)
  callback.searchParams.set('next',destination.value)
  const {error:failure}=await supabase.auth.signInWithOtp({email:email.value.trim(),options:{emailRedirectTo:callback.href}})
  if(failure) throw failure
  sent.value=true
 } catch {error.value='We couldn’t send your sign-in link. Check your email address and try again in a minute.'}
 finally {busy.value=false}
}
</script>
<template>
 <section class="page-shell collector-login">
  <div class="login-intro"><p class="section-intro">A place for your next piece.</p><h1>Good art.<br>Your next<br><em>chapter.</em></h1><p>Sign in to join the bidding and bring a new perspective home.</p><RouterLink :to="destination" class="text-link">← Keep exploring</RouterLink></div>
  <div class="login-form-wrap"><span class="section-intro">Collector sign-in / 01</span><h2>{{sent?'Check your inbox.':'Make yourself at home.'}}</h2>
   <template v-if="sent"><p role="status">We sent a sign-in link to <strong>{{email}}</strong>. Open it to return to your piece. Check your spam folder if it hasn’t arrived.</p><button class="text-link" @click="sent=false">Use another email or try again ↗</button></template>
   <form v-else @submit.prevent="signIn"><label for="collector-email">Email address</label><input id="collector-email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com" required :disabled="busy"><p class="form-hint">One email link. No password to remember. New here? Your account is created when you sign in.</p><PaintLoader v-if="busy" label="Sending your sign-in link…"/><p v-if="error" role="alert" class="form-error">{{error}}</p><button class="pill" :disabled="busy">{{busy?'Sending…':'Email me a sign-in link'}} <span aria-hidden="true">↗</span></button></form>
  </div>
 </section>
</template>
