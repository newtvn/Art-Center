<script setup>
import GalleryImage from './GalleryImage.vue'
defineProps({ art: {type: Object, required: true}, eager: Boolean })
</script>
<template>
  <article class="art-card">
    <RouterLink :to="{name:'art-detail', params:{id:art.id}}" class="art-image-link" :aria-label="`View ${art.title}`">
      <GalleryImage :src="art.image" :alt="art.title" :eager="eager" />
      <span class="art-open" aria-hidden="true">↗</span>
    </RouterLink>
    <div class="art-caption">
      <RouterLink :to="{name:'art-detail', params:{id:art.id}}">{{ art.title }}</RouterLink>
      <RouterLink v-if="art.artists?.name" :to="{name:'artist-detail', params:{name:art.artists.name}}" class="artist-credit">{{ art.artists.name }}</RouterLink>
      <span v-else class="artist-credit">{{ art.category }}</span>
    </div>
  </article>
</template>
