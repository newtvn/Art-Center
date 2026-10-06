<script setup>
import BrandLogo from '../../components/BrandLogo.vue'
import {computed,ref,watch,onMounted} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {supabase} from '../../lib/supabaseClient'
import {useAuth} from '../../composables/useAuth'
import {studioReturnPath} from '../../lib/studio'
import PaintLoader from '../../components/PaintLoader.vue'
const route=useRoute(),router=useRouter(),{user}=useAuth()
const email=ref(''),password=ref(''),method=ref('link'),busy=ref(false),sent=ref(false),error=ref('')
const destination=computed(()=>studioReturnPath(route.query.next))
watch(user,value=>{if(value)router.replace(destination.value)},{immediate:true})
onMounted(()=>{if(new URLSearchParams(window.location.hash.slice(1)).has('error')){error.value='That link has expired. Request a new one below.';window.history.replaceState(null,'',window.location.pathname+window.location.search)}})
async function signIn(){
 if(busy.value)return
 busy.value=true;error.value=''
 try{
  let result
  if(method.value==='password')result=await supabase.auth.signInWithPassword({email:email.value.trim(),password:password.value})
  else{
   const callback=new URL('/admin/login',window.location.origin);callback.searchParams.set('next',destination.value)
   result=await supabase.auth.signInWithOtp({email:email.value.trim(),options:{emailRedirectTo:callback.href}})
  }
  if(result.error)throw result.error
  if(method.value==='link')sent.value=true
  else await router.replace(destination.value)
 }catch{error.value=method.value==='password'?'We couldn’t sign you in. Check your email and password, or use an email link.':'We couldn’t send the link. Check your email address and try again in a minute.'}
 finally{busy.value=false}
}
function switchMethod(value){method.value=value;error.value='';password.value=''}
</script>
<template>
 <div class="studio-login">
  <header class="studio-login-header"><RouterLink to="/" class="studio-brand"><BrandLogo /></RouterLink><RouterLink to="/gallery" class="text-link">Back to the gallery ↗</RouterLink></header>
  <div class="studio-login-grid"><section class="studio-login-story"><p class="studio-eyebrow">For the makers. The thinkers. The originals.</p><h1>Your art.<br>Your story.<br><em>Your space.</em></h1><p>A place to gather your work, share your perspective,<br>and connect with the people who see it.</p><div class="studio-login-art" aria-hidden="true"><span></span><i></i><b>Make<br>your mark.</b></div><span class="studio-login-caption">The artist’s ledger / Art Center</span></section>
   <section class="studio-login-form"><p class="studio-eyebrow">Come on in / 01</p><h2>{{sent?'Check your inbox.':'Welcome to your studio.'}}</h2><p>{{sent?'Your next chapter is one click away.':'Sign in to the artist’s ledger. New here? Start with an email link.'}}</p>
    <template v-if="sent"><div class="studio-email-sent" role="status"><span aria-hidden="true">↗</span><p>We sent a sign-in link to<br><strong>{{email}}</strong>.</p><p>Open it to enter your studio. If it hasn’t arrived, check your spam folder.</p></div><button class="text-link" @click="sent=false">Use another email or try again ↗</button></template>
    <template v-else><div class="studio-login-methods" role="group" aria-label="Sign-in method"><button :class="{selected:method==='link'}" :aria-pressed="method==='link'" :disabled="busy" @click="switchMethod('link')">Email link</button><button :class="{selected:method==='password'}" :aria-pressed="method==='password'" :disabled="busy" @click="switchMethod('password')">Password</button></div><form class="studio-form" @submit.prevent="signIn"><div class="studio-field"><label for="studio-email">Email address</label><input id="studio-email" v-model="email" type="email" autocomplete="email" required :disabled="busy" placeholder="you@yourstudio.com"></div><div v-if="method==='password'" class="studio-field"><label for="studio-password">Password</label><input id="studio-password" v-model="password" type="password" autocomplete="current-password" required :disabled="busy" placeholder="Your password"></div><p class="studio-field-hint">{{method==='link'?'No password to remember. We’ll send you a secure sign-in link.':'Use the password for your existing artist account.'}}</p><PaintLoader v-if="busy" :label="method==='link'?'Sending your invitation back…':'Opening your studio…'"/><p v-if="error" class="studio-notice error" role="alert">{{error}}</p><button class="pill studio-primary" :disabled="busy">{{busy?'One moment…':method==='link'?'Send me a sign-in link':'Enter the ledger'}} <span aria-hidden="true">↗</span></button><button v-if="method==='password'" type="button" class="text-link" :disabled="busy" @click="switchMethod('link')">Forgot your password? Use an email link.</button></form></template>
    <p class="studio-login-help">Here to find your next piece?<br><RouterLink to="/login" class="text-link">Collector sign-in ↗</RouterLink></p>
   </section>
  </div><footer class="studio-login-footer"><span>Independent art. Shared everywhere.</span><span>Art Center © {{new Date().getFullYear()}}</span></footer>
 </div>
</template>
