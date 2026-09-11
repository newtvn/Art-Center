<script setup>
import {computed,ref} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useCollection} from '../composables/useCollection'
import {filterArtworks} from '../lib/gallery'
import ArtworkCard from '../components/ArtworkCard.vue'
import CollectionState from '../components/CollectionState.vue'
import GalleryRoom from '../components/GalleryRoom.vue'
const route = useRoute(), router = useRouter()
const {artworks,categories,loading,problem,refresh} = useCollection()
const search = ref(''), room = ref(false)
const category = computed(() => typeof route.query.category === 'string' ? route.query.category : 'All')
const filtered = computed(() => filterArtworks(artworks.value,category.value,search.value))
function select(value) { router.replace({query: value === 'All' ? {} : {category:value}}) }
</script>
<template>
  <section class="page-shell gallery-page"><div class="page-heading"><div><p class="section-intro">A world of perspectives</p><h1>The gallery.</h1></div><button v-if="artworks.length" class="pill" @click="room = true">Explore in motion <span aria-hidden="true">↗</span></button></div>
    <div class="gallery-tools"><div class="category-list" aria-label="Filter by medium"><button v-for="item in categories" :key="item" :aria-pressed="category === item" @click="select(item)">{{ item }}</button></div><label class="search-field"><span class="sr-only">Search artwork or artist</span><input v-model="search" type="search" placeholder="Find a work or artist"><span aria-hidden="true">⌕</span></label></div>
    <p v-if="!loading && artworks.length" class="result-count" aria-live="polite">{{ filtered.length }} {{ filtered.length === 1 ? 'work' : 'works' }}<span v-if="category !== 'All'"> in {{ category }}</span></p>
    <div v-if="filtered.length" class="art-grid"><ArtworkCard v-for="art in filtered" :key="art.id" :art="art" /></div>
    <CollectionState v-else-if="loading || problem || !artworks.length" :loading="loading" :problem="problem" @retry="refresh" />
    <div v-else class="collection-state"><h2>No works found.</h2><p>Try another medium or a different search.</p><button class="pill" @click="search = ''; select('All')">Show all works</button></div>
    <GalleryRoom v-if="room" :items="filtered.length ? filtered : artworks" @close="room = false" />
  </section>
</template>
