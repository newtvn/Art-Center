<script setup>
import GalleryImage from './GalleryImage.vue'
import {computed} from 'vue'
import {useAuctions} from '../composables/useAuctions'
import {countdown,money} from '../lib/auctions'
const props=defineProps({ art: {type: Object, required: true}, eager: Boolean })
const {auctions,now,problem}=useAuctions()
const auction=computed(()=>auctions.value.find(a=>a.artwork_id===props.art.id))
</script>
<template>
  <article class="art-card">
    <RouterLink :to="{name:'art-detail', params:{id:art.id}}" class="art-image-link" :aria-label="`View ${art.title}`">
      <GalleryImage :src="art.image" :alt="art.title" :eager="eager" />
      <span v-if="art.sold_at" class="sold-badge">Sold</span><span class="art-open" aria-hidden="true">↗</span>
    </RouterLink>
    <div class="art-caption">
      <RouterLink :to="{name:'art-detail', params:{id:art.id}}">{{ art.title }}</RouterLink>
      <RouterLink v-if="art.artists?.name" :to="{name:'artist-detail', params:{name:art.artists.name}}" class="artist-credit">{{ art.artists.name }}</RouterLink>
      <span v-else class="artist-credit">{{ art.category }}</span>
    </div>
    <div v-if="auction" class="card-auction"><span>{{auction.bid_count?'Current bid':'Starting price'}} <strong>{{money(auction.current_price)}}</strong></span><span>{{problem?'Updates unavailable':countdown(auction.ends_at,now)}}</span></div>
  </article>
</template>
