<script setup>
import {computed,ref} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import ArtworkFilters from '../../components/ArtworkFilters.vue'
import {filterArtworks} from '../../lib/gallery'
import ArtistLayout from '../../components/studio/ArtistLayout.vue'
import ArtworkEditor from '../../components/studio/ArtworkEditor.vue'
import GalleryImage from '../../components/GalleryImage.vue'
import PaintLoader from '../../components/PaintLoader.vue'
import {useArtistWorkspace} from '../../composables/useArtistWorkspace'
import {useAuctions} from '../../composables/useAuctions'
import {countdown,money} from '../../lib/auctions'
const route=useRoute(),router=useRouter(),{profile,artworks,loading,problem,refresh}=useArtistWorkspace()
const {auctions,now,problem:auctionProblem}=useAuctions()
const search=ref(''),category=ref('All'),notice=ref('')
const categories=computed(()=>['All',...new Set(artworks.value.map(art=>art.category).filter(Boolean))])
const filters=ref({country:'',artist:'',minPrice:'',maxPrice:'',minLength:'',maxLength:''})
const countries=computed(()=>[...new Set(artworks.value.map(art=>art.origin).filter(Boolean))].sort())
const filtered=computed(()=>filterArtworks(artworks.value.map(art=>({...art,artists:profile.value})),category.value,search.value,filters.value))
function clear(){search.value='';category.value='All';filters.value={country:'',artist:'',minPrice:'',maxPrice:'',minLength:'',maxLength:''}}
const editing=computed(()=>artworks.value.find(art=>art.id===route.query.edit))
const isNew=computed(()=>route.query.new==='1')
const auctionFor=id=>auctions.value.find(a=>a.artwork_id===id)
const close=()=>router.push('/admin/artworks')
async function saved(art){await refresh();notice.value='Your artwork is saved and visible in the gallery.';await router.replace({path:'/admin/artworks',query:{edit:art.id}})}
</script>
<template><ArtistLayout section="Your artwork">
 <p v-if="notice" class="studio-notice success" role="status">{{notice}} <button aria-label="Dismiss notification" @click="notice=''">×</button></p>
 <PaintLoader v-if="loading" label="Opening your collection…"/>
 <div v-else-if="problem" class="studio-empty" role="alert"><h1>Your collection is taking a moment.</h1><p>{{problem}}</p><button class="pill" @click="refresh">Try again ↗</button></div>
 <div v-else-if="isNew && !profile" class="studio-empty"><p class="studio-eyebrow">First, an introduction.</p><h1>Put a name<br>to your work.</h1><p>Create your artist profile before publishing your first piece.</p><RouterLink to="/admin/profile" class="pill studio-primary">Create your profile ↗</RouterLink><button class="text-link" @click="close">← Back to your collection</button></div>
 <ArtworkEditor v-else-if="isNew || editing" :key="editing?.id || 'new'" :art="editing" @close="close" @saved="saved"/>
 <template v-else>
  <header class="studio-page-heading"><div><p class="studio-eyebrow">Originals, made by you.</p><h1>A body<br>of <em>work.</em></h1><p>Your pieces, their stories, and what comes next.</p></div><RouterLink to="/admin/artworks?new=1" class="pill studio-primary">Add artwork <span aria-hidden="true">↗</span></RouterLink></header>
  <p v-if="route.query.edit" class="studio-notice error" role="alert">That artwork isn’t in your collection. Choose one of your pieces below.</p>
  <div v-if="artworks.length" class="studio-collection-tools"><div class="studio-filter-tabs" aria-label="Filter by medium"><button v-for="medium in categories" :key="medium" :class="{selected:category===medium}" :aria-pressed="category===medium" @click="category=medium">{{medium}}<span v-if="medium==='All'">{{artworks.length}}</span></button></div><label class="studio-search"><span class="sr-only">Search your artwork</span><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8" cy="8" r="5.5"/><path d="m12 12 5 5"/></svg><input v-model="search" type="search" placeholder="Find a piece…"></label></div>
  <ArtworkFilters v-if="artworks.length" v-model="filters" :countries="countries" :show-artist="false" />
  <p v-if="artworks.length" class="studio-results" role="status">{{filtered.length}} {{filtered.length===1?'piece':'pieces'}} in view</p>
  <div v-if="filtered.length" class="studio-art-grid"><article v-for="(art,i) in filtered" :key="art.id" class="studio-art-card"><RouterLink :to="{path:'/admin/artworks',query:{edit:art.id}}" class="studio-art-card-image"><GalleryImage :src="art.image" :alt="art.title" :eager="i<3"/><span class="studio-art-edit">Edit artwork ↗</span><span class="studio-art-index">{{String(i+1).padStart(2,'0')}}</span></RouterLink><div class="studio-art-card-title"><div><h2><RouterLink :to="{path:'/admin/artworks',query:{edit:art.id}}">{{art.title}}</RouterLink></h2><p>{{[art.category,art.year].filter(Boolean).join(' / ')}}</p></div><span v-if="art.price!=null">{{money(art.price)}}</span></div><div class="studio-art-card-bottom"><template v-if="auctionFor(art.id)"><span class="studio-status" :class="{live:Date.parse(auctionFor(art.id).ends_at)>now}">{{Date.parse(auctionFor(art.id).ends_at)>now?'Bidding open':'Auction ended'}}</span><span>{{auctionProblem?'Updates unavailable':countdown(auctionFor(art.id).ends_at,now)}}</span><strong>{{money(auctionFor(art.id).current_price)}}</strong></template><template v-else><span class="studio-status">In the gallery</span><RouterLink :to="{path:'/admin/artworks',query:{edit:art.id}}">{{auctionProblem?'Edit piece':'Set up auction'}} ↗</RouterLink></template></div></article></div>
  <div v-else-if="artworks.length" class="studio-empty"><h2>No pieces found.</h2><p>Try another search, medium, country, price or length.</p><button class="text-link" @click="clear">Clear filters ↗</button></div>
  <div v-else class="studio-empty studio-collection-empty"><span class="studio-empty-mark" aria-hidden="true">＋</span><h2>There’s space<br>for your first piece.</h2><p>Add an image, tell its story, and share it with the gallery.</p><RouterLink to="/admin/artworks?new=1" class="pill studio-primary">Add your first artwork ↗</RouterLink></div>
 </template>
</ArtistLayout></template>
