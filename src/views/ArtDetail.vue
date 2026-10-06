<script setup>
import {computed,ref,onUnmounted} from 'vue'
import {useRoute} from 'vue-router'
import {useCollection} from '../composables/useCollection'
import GalleryImage from '../components/GalleryImage.vue'
import CollectionState from '../components/CollectionState.vue'
import MotionText from '../components/MotionText.vue'
import ArtworkCard from '../components/ArtworkCard.vue'
import AuctionPanel from '../components/AuctionPanel.vue'
import PurchasePanel from '../components/PurchasePanel.vue'
import GalleryRoom from '../components/GalleryRoom.vue'
const route=useRoute()
const {artworks,loading,problem,refresh}=useCollection()
const art=computed(()=>artworks.value.find(work=>String(work.id)===route.params.id))
const artist=computed(()=>art.value?.artists)
const related=computed(()=>artworks.value.filter(work=>work.artist_id && work.artist_id===art.value?.artist_id && work.id!==art.value?.id).slice(0,3))
const history=computed(()=>art.value?.long_history || art.value?.longHistory)
const inspiration=computed(()=>art.value?.inspiration_text || art.value?.inspirationText)
const room=ref(false), wall=ref(false), fullImage=ref(null)
let previousFocus
function openImage(){previousFocus=document.activeElement;fullImage.value?.showModal()}
function closeImage(){fullImage.value?.close();previousFocus?.focus()}
onUnmounted(()=>fullImage.value?.close())
</script>
<template><section class="page-shell artwork-detail"><RouterLink to="/gallery" class="back-link">← Back to the gallery</RouterLink><template v-if="art"><div class="artwork-layout"><div class="artwork-visual"><button class="detail-image" @click="openImage" :aria-label="`Enlarge ${art.title}`"><GalleryImage :src="art.image" :alt="art.title" eager /><span>View full image ↗</span></button><button class="wall-launch" @click="wall=true;room=true">Picture it in your space <span aria-hidden="true">↗</span></button></div><div class="artwork-story"><p class="section-intro">{{[art.category,art.year].filter(Boolean).join(', ')}}</p><MotionText as="h1" :text="art.title" /><RouterLink v-if="artist?.name" :to="{name:'artist-detail',params:{name:artist.name}}" class="artist-byline"><GalleryImage :src="artist.photo" :alt="artist.name" /><span>By {{artist.name}}</span><span aria-hidden="true">↗</span></RouterLink><p v-if="history" class="art-history">{{history}}</p><blockquote v-if="inspiration">“{{inspiration}}”</blockquote><dl class="art-facts"><div v-if="art.dimensions"><dt>Dimensions</dt><dd>{{art.dimensions}}</dd></div><div v-if="art.origin"><dt>Origin</dt><dd>{{art.origin}}</dd></div><div v-if="art.category"><dt>Medium</dt><dd>{{art.category}}</dd></div><div v-if="art.price != null"><dt>Price (USD)</dt><dd>{{new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(art.price)}}</dd></div></dl><AuctionPanel :key="art.id" :art="art" /><PurchasePanel :key="`buy-${art.id}`" :art="art" /><button class="pill" @click="wall=false;room=true">Explore in motion <span aria-hidden="true">↗</span></button><div v-if="artist?.long_bio" class="artist-note"><h2>The person behind the piece.</h2><MotionText :text="artist.long_bio" /><RouterLink :to="{name:'artist-detail',params:{name:artist.name}}" class="text-link">Meet {{artist.name}} ↗</RouterLink></div></div></div><template v-if="related.length"><div class="section-heading"><h2>More from {{artist?.name}}.</h2></div><div class="art-grid"><ArtworkCard v-for="work in related" :key="work.id" :art="work" /></div></template><GalleryRoom v-if="room" :items="[art,...related]" :wall="wall" @close="room=false" /><dialog ref="fullImage" class="full-image-dialog" aria-label="Full artwork image" @click="event=>{if(event.target===fullImage)closeImage()}" @close="previousFocus?.focus()"><button autofocus aria-label="Close full image" @click="closeImage">Close ×</button><GalleryImage :src="art.image" :alt="art.title" eager /></dialog></template><CollectionState v-else :loading="loading" :problem="problem" title="Artwork not found." message="This work may no longer be available. Return to the gallery to find another perspective." @retry="refresh" /></section></template>
