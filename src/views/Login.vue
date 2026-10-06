<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../composables/useAuth'
import {emailSignInOptions,emailAccessError,emailCallbackError,clearEmailCallbackError} from '../lib/emailAccess'
import { safeReturnPath } from '../lib/auctions'
import PaintLoader from '../components/PaintLoader.vue'
const route=useRoute(), router=useRouter(), {user}=useAuth()
const email=ref(''), busy=ref(false), sent=ref(false), error=ref('')
const destination=computed(()=>safeReturnPath(route.query.next))
watch(user, value=>{if(value) router.replace(destination.value)}, {immediate:true})
onMounted(()=>{error.value=emailCallbackError(window.location);if(error.value)clearEmailCallbackError(window.location,window.history)})
async function signIn() {
 if(busy.value) return
 busy.value=true; error.value=''
 try {
  const {error:failure}=await supabase.auth.signInWithOtp({email:email.value.trim(),options:emailSignInOptions('collector',destination.value,window.location.origin,import.meta.env.DEV)})
  if(failure) throw failure
  sent.value=true
 } catch(failure) {error.value=emailAccessError(failure)}
 finally {busy.value=false}
}
</script>
<template>
 <section class="page-shell collector-login">
  <div class="login-intro"><p class="section-intro">A place for your next piece.</p><h1>Good art.<br>Your next<br><em>chapter.</em></h1><p>Sign in or create your collector account with your email. Find a piece, meet its maker, and join the bidding.</p><RouterLink :to="destination" class="text-link">← Keep exploring</RouterLink></div>
  <div class="login-form-wrap"><span class="section-intro">Collector access / 01</span><h2>{{sent?'Check your inbox.':'Sign in or sign up.'}}</h2>
   <template v-if="sent"><p role="status">We sent a secure email link to <strong>{{email}}</strong>. Open the latest link to sign in or finish creating your account and return to your piece. Check your spam folder if it hasn’t arrived.</p><button class="text-link" @click="sent=false">Use another email or try again ↗</button></template>
   <form v-else @submit.prevent="signIn"><label for="collector-email">Email address</label><input id="collector-email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com" required :disabled="busy"><p class="form-hint">No password needed. Your first email link creates your account; future links sign you in.</p><PaintLoader v-if="busy" label="Sending your sign-in link…"/><p v-if="error" role="alert" class="form-error">{{error}}</p><button class="pill" :disabled="busy">{{busy?'Sending…':'Continue with email'}} <span aria-hidden="true">↗</span></button></form>
   <p class="collector-artist-help">Here to share your work? <RouterLink to="/admin/login" class="text-link">Artist sign-in or sign-up ↗</RouterLink></p>
  </div>
 </section>
</template>
