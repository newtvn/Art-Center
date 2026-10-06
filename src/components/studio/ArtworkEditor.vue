<script setup>
import {computed,ref,onUnmounted,watch} from 'vue'
import {supabase} from '../../lib/supabaseClient'
import {useArtistWorkspace} from '../../composables/useArtistWorkspace'
import {artworkPayload,imageProblem,uploadStudioImage} from '../../lib/studio'
import {parseDimensions,sizeProblem} from '../../lib/dimensions'
import {countries} from '../../lib/countries'
import {mediaCategories} from '../../lib/gallery'
import {artworkSaveMessage,checkArtworkSchema} from '../../lib/backendErrors'
import {readArtworkDraft,writeArtworkDraft} from '../../lib/artworkDraft'
import {money} from '../../lib/auctions'
import GalleryImage from '../GalleryImage.vue'
import PaintLoader from '../PaintLoader.vue'
import AuctionSettings from '../AuctionSettings.vue'
const props=defineProps({art:Object})
const emit=defineEmits(['close','saved'])
const {user,profile}=useArtistWorkspace()
const initialSize=parseDimensions(props.art?.dimensions) || {lengthCm:'',widthCm:'',depthCm:''}
const form=ref({...initialSize,title:'',category:'Painting',year:String(new Date().getFullYear()),price:'',dimensions:'',origin:'',long_history:'',inspiration_text:'',...props.art})
const draftKey=`artcenter:draft:${user.value?.id}:${props.art?.id || 'new'}`
try{if(typeof window!=='undefined')Object.assign(form.value,readArtworkDraft(window.sessionStorage,draftKey))}catch{}
function keepDraft(){try{if(typeof window!=='undefined')writeArtworkDraft(window.sessionStorage,draftKey,form.value)}catch{}}
function clearDraft(){try{window.sessionStorage.removeItem(draftKey)}catch{}}
function discard(){clearDraft();emit('close')}
watch(form,keepDraft,{deep:true,flush:'sync'})
const file=ref(null),preview=ref(form.value.image || ''),busy=ref(false),error=ref('')
const categories=computed(()=>[...new Set([...mediaCategories,form.value.category].filter(Boolean))])
let objectUrl
function selectImage(event){
 const candidate=event.target.files?.[0]
 if(!candidate)return
 const issue=imageProblem(candidate)
 if(issue){error.value=issue;event.target.value='';return}
 if(objectUrl)URL.revokeObjectURL(objectUrl)
 objectUrl=URL.createObjectURL(candidate);file.value=candidate;preview.value=objectUrl;error.value=''
}
onUnmounted(()=>{if(objectUrl)URL.revokeObjectURL(objectUrl)})
async function save(){
 if(busy.value)return
 error.value=''
 if(!user.value || !profile.value){error.value='Save your artist profile before publishing artwork.';return}
 if(!form.value.title.trim()){error.value='Give your artwork a title.';return}
 if(!preview.value){error.value='Choose an image for your artwork.';return}
 if(form.value.price!=='' && form.value.price!=null && (!Number.isFinite(Number(form.value.price)) || Number(form.value.price)<0)){error.value='Enter a valid price or leave it blank.';return}
 const sizeIssue=sizeProblem(form.value)
 if(sizeIssue){error.value=sizeIssue;return}
 busy.value=true
 try{
  keepDraft()
  await checkArtworkSchema(supabase)
  const url=file.value?await uploadStudioImage(supabase,user.value.id,file.value):form.value.image
  form.value.image=url;file.value=null
  const payload=artworkPayload(form.value,user.value.id,url)
  const query=props.art?.id?supabase.from('artworks').update(payload).eq('id',props.art.id).eq('artist_id',user.value.id):supabase.from('artworks').insert(payload)
  const {data,error:failure}=await query.select().single()
  if(failure)throw failure
  clearDraft()
  emit('saved',data)
 }catch(failure){error.value=artworkSaveMessage(failure)}
 finally{busy.value=false}
}
</script>
<template>
 <div class="studio-editor-header"><button class="text-link" :disabled="busy" @click="emit('close')">← Your collection</button><RouterLink v-if="art?.id" :to="'/gallery/'+art.id" class="text-link">View in gallery ↗</RouterLink></div>
 <header class="studio-page-heading compact"><div><p class="studio-eyebrow">{{art?'Give your work room to grow.':'The beginning of something.'}}</p><h1>{{art?'Every detail':'A new'}} <em>{{art?'matters.':'perspective.'}}</em></h1><p>{{art?'Update the piece, tell its story, and manage bidding.':'Share an original piece with the people who will love it.'}}</p></div><span class="studio-status">{{art?'Published artwork':'New artwork'}}</span></header>
 <form class="studio-editor-grid" @submit.prevent="save">
  <aside class="studio-art-preview"><div class="studio-upload-art"><GalleryImage v-if="preview" :src="preview" :alt="form.title || 'Artwork preview'" eager/><div v-else class="studio-upload-placeholder"><span aria-hidden="true">＋</span><h2>Your art goes here.</h2><p>Let the piece speak first.</p></div><label class="studio-upload-control"><input type="file" accept="image/jpeg,image/png,image/webp" @change="selectImage" :disabled="busy" aria-label="Choose artwork image"><span>{{preview?'Change image':'Choose an image'}} ↗</span></label></div><p class="studio-field-hint">JPG, PNG or WebP · Up to 10 MB<br>Use a clear image that shows the full piece.</p><div class="studio-preview-caption"><h2>{{form.title || 'Untitled, for now.'}}</h2><p>{{[form.category,form.year].filter(Boolean).join(' / ')}}</p><span v-if="form.price!=='' && form.price!=null">{{money(form.price)}}</span></div></aside>
  <div class="studio-form">
   <fieldset :disabled="busy"><legend><span>01</span> The essentials</legend><div class="studio-field"><label for="art-title">Artwork title <span>Required</span></label><input id="art-title" v-model="form.title" required maxlength="200" placeholder="Give your piece a name"></div><div class="studio-field-pair"><div class="studio-field"><label for="art-medium">Medium</label><select id="art-medium" v-model="form.category"><option v-for="category in categories" :key="category">{{category}}</option></select></div><div class="studio-field"><label for="art-year">Year</label><input id="art-year" v-model="form.year" maxlength="30" placeholder="2026"></div></div><div class="studio-field"><label for="art-artist">Artist name</label><input id="art-artist" :value="profile?.name || ''" readonly><p class="studio-field-hint">Published under your signed-in artist profile. Update your name in your profile.</p></div>
   <div class="studio-field-pair"><div class="studio-field"><label for="art-price">Listed price <span>USD · Optional</span></label><input id="art-price" v-model="form.price" type="number" min="0" step="0.01" max="9999999999.99" inputmode="decimal" placeholder="0.00"></div><div class="studio-field"><label for="art-origin">Country of origin <span>Optional</span></label><input id="art-origin" v-model="form.origin" type="search" list="art-countries" maxlength="200" placeholder="Search a country"><datalist id="art-countries"><option v-for="country in countries" :key="country" :value="country"/></datalist></div></div>
   <div class="studio-field-pair"><div class="studio-field"><label for="art-length">Length <span>cm · Optional</span></label><input id="art-length" v-model="form.lengthCm" type="number" min="0.0001" step="any" inputmode="decimal" placeholder="60"></div><div class="studio-field"><label for="art-width">Width <span>cm · Optional</span></label><input id="art-width" v-model="form.widthCm" type="number" min="0.0001" step="any" inputmode="decimal" placeholder="80"></div></div>
   <div class="studio-field"><label for="art-depth">Depth <span>cm · Optional</span></label><input id="art-depth" v-model="form.depthCm" type="number" min="0.0001" step="any" inputmode="decimal" placeholder="For sculpture or three-dimensional work"></div>
   <p class="studio-field-hint">Size is saved as length × width × depth in centimetres, so collectors can filter by length. Leave measurements blank for pieces without a physical size.</p>
   <div v-if="!form.lengthCm" class="studio-field"><label for="art-size">Other dimensions <span>Optional</span></label><input id="art-size" v-model="form.dimensions" maxlength="100" placeholder="Variable size or a digital format"><p class="studio-field-hint">Existing size descriptions are kept here. Add a numeric length above to make the piece searchable by size.</p></div></fieldset>
   <fieldset :disabled="busy"><legend><span>02</span> Behind the piece</legend><p class="studio-field-hint">A little context can change the way someone sees your work.</p><div class="studio-field"><label for="art-story">The story <span>Optional</span></label><textarea id="art-story" v-model="form.long_history" rows="5" maxlength="12000" placeholder="The process, the history, the idea you kept coming back to…"></textarea></div><div class="studio-field"><label for="art-inspiration">What inspired it? <span>Optional</span></label><textarea id="art-inspiration" v-model="form.inspiration_text" rows="3" maxlength="4000" placeholder="A place, a feeling, a moment."></textarea></div></fieldset>
   <p v-if="error" class="studio-notice error" role="alert">{{error}}</p><PaintLoader v-if="busy" label="Making room for your artwork…"/>
   <div class="studio-savebar"><p>{{art?'Changes appear in the gallery when saved.':'Your piece will be visible in the public gallery.'}}</p><div><button type="button" class="studio-secondary" :disabled="busy" @click="discard">Discard changes</button><button class="pill studio-primary" :disabled="busy">{{busy?'Saving…':art?'Save changes':'Publish artwork'}} <span aria-hidden="true">↗</span></button></div></div>
  </div>
 </form>
 <section class="studio-auction-editor"><div><p class="studio-eyebrow">A new home for your art / 03</p><h2>Open it to<br>possibility.</h2><p>Set a starting price and a closing time.<br>Collectors sign in before they bid.</p></div><div v-if="art?.id"><AuctionSettings :art="art"/></div><p v-else class="studio-field-hint">Publish your artwork first, then you can open an auction here.</p></section>
</template>
