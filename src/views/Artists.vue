<script setup>
import {ref,computed} from 'vue'
import {useCollection} from '../composables/useCollection'
import GalleryImage from '../components/GalleryImage.vue'
import CollectionState from '../components/CollectionState.vue'
const {artists,loading,problem,refresh} = useCollection()
const search=ref('')
const filtered=computed(()=>artists.value.filter(artist=>[artist.name,artist.specialty].filter(Boolean).join(' ').toLocaleLowerCase().includes(search.value.toLocaleLowerCase().trim())))
</script>
<template><section class="page-shell"><div class="page-heading"><div><p class="section-intro">The people behind the perspective</p><h1>The artists.</h1></div><p class="heading-description">Different places. Distinct voices.<br>A shared instinct to create.</p></div><label v-if="artists.length" class="search-field artist-search"><span class="sr-only">Search artists</span><input v-model="search" type="search" placeholder="Find an artist"><span aria-hidden="true">⌕</span></label>
  <div v-if="filtered.length" class="artist-grid"><article v-for="artist in filtered" :key="artist.id" class="artist-card"><RouterLink :to="{name:'artist-detail',params:{name:artist.name}}" class="artist-portrait"><GalleryImage :src="artist.photo" :alt="artist.name" /><span aria-hidden="true">↗</span></RouterLink><RouterLink :to="{name:'artist-detail',params:{name:artist.name}}"><h2>{{artist.name}}</h2></RouterLink><p>{{artist.specialty || 'Independent artist'}}</p></article></div>
  <CollectionState v-else-if="loading || problem || !artists.length" :loading="loading" :problem="problem" title="New voices belong here." message="Artist profiles will appear here as the community grows. Each one is a window into a different world." @retry="refresh" />
  <div v-else class="collection-state"><h2>No artists found.</h2><button class="pill" @click="search=''">Show all artists</button></div>
</section></template>
