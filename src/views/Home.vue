<script setup>
import { computed, ref } from 'vue'
import { useCollection } from '../composables/useCollection'
import ArtworkCard from '../components/ArtworkCard.vue'
import CollectionState from '../components/CollectionState.vue'
import GalleryRoom from '../components/GalleryRoom.vue'
const {artworks, loading, problem, refresh} = useCollection()
const featured = computed(() => artworks.value.slice(0,8))
const room = ref(false)
</script>
<template>
  <div class="home-page">
    <section class="hero-composition" :class="{'has-art': featured.length, 'compact-collection': featured.length > 0 && featured.length <= 5}" aria-labelledby="hero-heading">
      <div class="hero-copy"><h1 id="hero-heading">Beyond borders.<br>Within reach.</h1><p>Art from different worlds.<br>Stories that bring us closer.</p><RouterLink to="/gallery" class="pill">Explore the gallery <span aria-hidden="true">↗</span></RouterLink></div>
      <div class="hero-notes"><span>↗ &nbsp; Original perspectives.</span><span>↗ &nbsp; Meet the makers.</span><button v-if="featured.length" @click="room = true">↗ &nbsp; Explore in motion.</button><span v-else>↗ &nbsp; A world of possibility.</span></div>
      <template v-if="featured.length"><ArtworkCard v-for="(art,index) in featured" :key="art.id" :art="art" eager :class="`hero-art hero-art-${index}`" /></template>
      <template v-else><div class="empty-frame frame-one" aria-hidden="true"><span>Room for<br>a new perspective.</span></div><div class="empty-frame frame-two" aria-hidden="true"><span>Art<br>belongs<br>here.</span><i>↗</i></div><div class="hero-empty"><CollectionState :loading="loading" :problem="problem" @retry="refresh" /></div></template>
    </section>
    <section class="home-invitation"><p>A gallery without borders.</p><h2>Find a piece that stays with you.<br>Meet the person behind it.</h2><RouterLink to="/artists" class="text-link">Discover the artists <span aria-hidden="true">↗</span></RouterLink></section>
    <GalleryRoom v-if="room" :items="artworks" @close="room = false" />
  </div>
</template>
