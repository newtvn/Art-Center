<script setup>
import {computed,ref,watch} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useArtistWorkspace} from '../../composables/useArtistWorkspace'
import {useAuth} from '../../composables/useAuth'
import GalleryImage from '../GalleryImage.vue'
const props=defineProps({section:{type:String,default:'Overview'}})
const route=useRoute(),router=useRouter(),{profile,user}=useArtistWorkspace(),{signOut,ready}=useAuth()
watch([user,ready],([account,isReady])=>{if(isReady && !account)router.replace({path:'/admin/login',query:{next:route.path}})},{immediate:true})
const leaving=ref(false),error=ref('')
const initials=computed(()=>(profile.value?.name || user.value?.email || 'A').slice(0,1).toUpperCase())
const links=[{path:'/admin/dashboard',label:'Overview',number:'01'},{path:'/admin/artworks',label:'Your artwork',number:'02'},{path:'/admin/profile',label:'Artist profile',number:'03'}]
async function leave(){
 leaving.value=true;error.value=''
 try{const {error:failure}=await signOut();if(failure)throw failure;await router.replace('/admin/login')}
 catch{error.value='Couldn’t sign out. Please try again.'}
 finally{leaving.value=false}
}
</script>
<template>
 <div class="studio-shell">
  <aside class="studio-rail">
   <RouterLink to="/" class="studio-brand" aria-label="Art Center home"><svg viewBox="0 0 40 32" aria-hidden="true"><circle cx="22" cy="12" r="10" fill="currentColor"/><circle cx="22" cy="12" r="4" fill="white"/><circle cx="7" cy="15" r="3" fill="currentColor"/></svg><span>Art Center.</span></RouterLink>
   <div class="studio-rail-title"><span class="studio-eyebrow">For the makers</span><p>The artist’s<br>ledger.</p></div>
   <nav class="studio-nav" aria-label="Artist workspace"><RouterLink v-for="link in links" :key="link.path" :to="link.path" :class="{active:route.path===link.path}" :aria-current="route.path===link.path?'page':undefined"><span>{{link.number}}</span>{{link.label}}<b aria-hidden="true">↗</b></RouterLink></nav>
   <div class="studio-rail-foot"><p>A space to make<br>your mark.</p><RouterLink to="/gallery">Visit the gallery <span aria-hidden="true">↗</span></RouterLink></div>
  </aside>
  <div class="studio-body">
   <header class="studio-topbar"><p>Artist space <span>/</span> <strong>{{section}}</strong></p><div class="studio-account"><span class="studio-avatar"><GalleryImage v-if="profile?.photo" :src="profile.photo" :alt="profile.name"/><span v-else>{{initials}}</span></span><span class="studio-account-name">{{profile?.name || user?.email || 'Your studio'}}</span><button @click="leave" :disabled="leaving">{{leaving?'Leaving…':'Sign out'}} <span aria-hidden="true">↗</span></button></div></header>
   <p v-if="error" role="alert" class="studio-notice error">{{error}}</p>
   <div class="studio-content"><slot/></div>
   <footer class="studio-footer"><span>Art Center. A space for every perspective.</span><span>{{new Date().getFullYear()}} / Artist ledger</span></footer>
  </div>
 </div>
</template>
