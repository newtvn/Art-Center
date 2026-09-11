<script setup>
import {computed,ref} from 'vue'
import {useRoute} from 'vue-router'
import {useCollection} from '../composables/useCollection'
import {safeExternalUrl} from '../lib/gallery'
import GalleryImage from '../components/GalleryImage.vue'
import CollectionState from '../components/CollectionState.vue'
import ArtworkCard from '../components/ArtworkCard.vue'
import MotionText from '../components/MotionText.vue'
import GalleryRoom from '../components/GalleryRoom.vue'
const route=useRoute()
const {artists,artworks,loading,problem,refresh}=useCollection()
const artist=computed(()=>artists.value.find(person=>person.name===route.params.name))
const works=computed(()=>artworks.value.filter(art=>art.artist_id===artist.value?.id))
const room=ref(false)
const links=computed(()=>Object.entries(artist.value?.socials || {}).map(([label,url])=>({label,url:safeExternalUrl(url)})).filter(link=>link.url))
</script>
<template><section class="page-shell artist-detail"><RouterLink to="/artists" class="back-link">← All artists</RouterLink><template v-if="artist"><div class="artist-profile"><div class="profile-portrait"><GalleryImage :src="artist.photo" :alt="artist.name" eager /></div><div class="profile-copy"><p class="section-intro">{{artist.specialty || 'Meet the artist'}}</p><MotionText as="h1" :text="artist.name" /><MotionText v-if="artist.long_bio" class="artist-bio" :text="artist.long_bio" /><p v-else class="artist-bio">This artist’s story is still being written. Explore their work below.</p><div class="profile-actions"><button v-if="works.length || artist.photo" class="pill" @click="room=true">Step into the studio <span aria-hidden="true">↗</span></button><a v-for="link in links" :key="link.label" :href="link.url" target="_blank" rel="noopener noreferrer" class="text-link">{{link.label}} ↗</a></div></div></div><div class="section-heading"><h2>Through their eyes.</h2><span>{{works.length}} {{works.length===1?'work':'works'}}</span></div><div v-if="works.length" class="art-grid"><ArtworkCard v-for="art in works" :key="art.id" :art="art" /></div><p v-else class="empty-works">Their next collection is on its way.</p><GalleryRoom v-if="room" :items="works" :artist="artist" @close="room=false" /></template><CollectionState v-else :loading="loading" :problem="problem" title="Artist not found." message="This profile may not be available. Explore the artist directory to discover more voices." @retry="refresh" /></section></template>
