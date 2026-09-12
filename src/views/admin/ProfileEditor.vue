<script setup>
import {computed,ref,watch,onUnmounted} from 'vue'
import ArtistLayout from '../../components/studio/ArtistLayout.vue'
import GalleryImage from '../../components/GalleryImage.vue'
import PaintLoader from '../../components/PaintLoader.vue'
import {useArtistWorkspace} from '../../composables/useArtistWorkspace'
import {supabase} from '../../lib/supabaseClient'
import {imageProblem,uploadStudioImage} from '../../lib/studio'
import {safeExternalUrl} from '../../lib/gallery'
const {user,profile,loading,problem,refresh}=useArtistWorkspace()
const empty=()=>({name:'',specialty:'',long_bio:'',photo:'',socials:{instagram:'',website:''}})
const form=ref(empty()),file=ref(null),busy=ref(false),error=ref(''),notice=ref(''),baseline=ref('')
const dirty=computed(()=>!!file.value || JSON.stringify(form.value)!==baseline.value)
const publicLink=computed(()=>profile.value?.name?{name:'artist-detail',params:{name:profile.value.name}}:null)
let objectUrl
function reset(){const value=profile.value;form.value=value?{name:value.name||'',specialty:value.specialty||'',long_bio:value.long_bio||'',photo:value.photo||'',socials:{...value.socials,instagram:value.socials?.instagram||'',website:value.socials?.website||''}}:empty();baseline.value=JSON.stringify(form.value);file.value=null;if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null};error.value=''}
watch(profile,()=>{if(!baseline.value || !dirty.value)reset()},{immediate:true})
function selectPhoto(event){
 const candidate=event.target.files?.[0];if(!candidate)return
 const issue=imageProblem(candidate);if(issue){error.value=issue;event.target.value='';return}
 if(objectUrl)URL.revokeObjectURL(objectUrl)
 objectUrl=URL.createObjectURL(candidate);file.value=candidate;form.value.photo=objectUrl;error.value='';notice.value=''
}
onUnmounted(()=>{if(objectUrl)URL.revokeObjectURL(objectUrl)})
async function save(){
 if(busy.value)return
 error.value='';notice.value=''
 if(!user.value)return
 if(!form.value.name.trim()){error.value='Add the name you want collectors to see.';return}
 for(const url of [form.value.socials.instagram,form.value.socials.website])if(url.trim()&&!safeExternalUrl(url.trim())){error.value='Use a full website address beginning with https:// or http://.';return}
 busy.value=true
 try{
  const photo=file.value?await uploadStudioImage(supabase,user.value.id,file.value):form.value.photo
  form.value.photo=photo;file.value=null
  const data={id:user.value.id,name:form.value.name.trim(),specialty:form.value.specialty.trim(),long_bio:form.value.long_bio.trim(),photo,socials:{...form.value.socials,instagram:form.value.socials.instagram.trim(),website:form.value.socials.website.trim()}}
  const {error:failure}=await supabase.from('artists').upsert(data)
  if(failure)throw failure
  form.value={...data};delete form.value.id;file.value=null;baseline.value=JSON.stringify(form.value)
  await refresh();notice.value='Your profile is saved. This is how collectors will see you.'
 }catch{error.value='Your profile couldn’t be saved. Your changes are still here—please try again.'}
 finally{busy.value=false}
}
</script>
<template><ArtistLayout section="Artist profile">
 <header class="studio-page-heading"><div><p class="studio-eyebrow">More than a name on the wall.</p><h1>The person<br>behind <em>the piece.</em></h1><p>Tell your story in your own words.</p></div><RouterLink v-if="publicLink" :to="publicLink" class="pill">View public profile ↗</RouterLink></header>
 <PaintLoader v-if="loading" label="Opening your artist profile…"/>
 <div v-else-if="problem" class="studio-empty" role="alert"><h2>Your story is taking a moment.</h2><p>{{problem}}</p><button class="pill" @click="refresh">Try again ↗</button></div>
 <form v-else class="studio-profile-grid" @submit.prevent="save">
  <aside class="studio-profile-preview"><div class="studio-profile-photo"><GalleryImage v-if="form.photo" :src="form.photo" :alt="form.name || 'Your portrait'" eager/><div v-else class="studio-portrait-placeholder"><span>{{form.name?.slice(0,1) || '↗'}}</span><p>A face to<br>the name.</p></div><label class="studio-upload-control"><input type="file" accept="image/jpeg,image/png,image/webp" @change="selectPhoto" :disabled="busy" aria-label="Choose profile portrait"><span>{{form.photo?'Change portrait':'Add a portrait'}} ↗</span></label></div><p class="studio-field-hint">JPG, PNG or WebP · Up to 10 MB<br>A portrait helps collectors connect with you.</p><div class="studio-profile-preview-copy"><p class="studio-eyebrow">Your profile, at a glance</p><h2>{{form.name || 'Your name here.'}}</h2><p>{{form.specialty || 'Your medium. Your point of view.'}}</p><blockquote>{{form.long_bio || 'Every artist has a story. This is a place for yours.'}}</blockquote></div></aside>
  <div class="studio-form"><fieldset :disabled="busy"><legend><span>01</span> An introduction</legend><div class="studio-field"><label for="artist-name">Artist name <span>Required</span></label><input id="artist-name" v-model="form.name" required maxlength="150" autocomplete="name" placeholder="The name on your work"></div><div class="studio-field"><label for="artist-medium">Your medium or specialty</label><input id="artist-medium" v-model="form.specialty" maxlength="200" placeholder="Painting, photography, a little of everything…"></div><div class="studio-field"><label for="artist-bio">Your story <span>Optional</span></label><textarea id="artist-bio" v-model="form.long_bio" rows="9" maxlength="12000" placeholder="Where you began. What moves you. What you’re exploring now."></textarea><span class="studio-field-hint">Write in your own voice. This appears on your public artist page.</span></div></fieldset>
   <fieldset :disabled="busy"><legend><span>02</span> Keep the conversation going</legend><div class="studio-field"><label for="artist-instagram">Instagram <span>Optional</span></label><input id="artist-instagram" v-model="form.socials.instagram" type="url" maxlength="2000" placeholder="https://instagram.com/yourname"></div><div class="studio-field"><label for="artist-website">Website <span>Optional</span></label><input id="artist-website" v-model="form.socials.website" type="url" maxlength="2000" placeholder="https://yourstudio.com"></div></fieldset>
   <p v-if="error" class="studio-notice error" role="alert">{{error}}</p><p v-if="notice" class="studio-notice success" role="status">{{notice}}</p><PaintLoader v-if="busy" label="Putting your story on the wall…"/>
   <div class="studio-savebar"><p>{{dirty?'You have unsaved changes.':'Your public introduction, made by you.'}}</p><div><button type="button" class="studio-secondary" :disabled="busy || !dirty" @click="reset">Reset changes</button><button class="pill studio-primary" :disabled="busy">{{busy?'Saving…':'Save profile'}} ↗</button></div></div>
  </div>
 </form>
</ArtistLayout></template>
