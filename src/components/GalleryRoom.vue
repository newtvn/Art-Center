<script setup>
import {computed,ref,onMounted,onUnmounted} from 'vue'
import GalleryImage from './GalleryImage.vue'
import MotionText from './MotionText.vue'
import WallVisualizer from './WallVisualizer.vue'
const props = defineProps({items:{type:Array,required:true}, artist:Object, initialIndex:{type:Number,default:0}, wall:{type:Boolean,default:false}})
const emit = defineEmits(['close'])
const dialog = ref(null), index = ref(props.initialIndex), mode = ref(props.wall ? 'wall' : 'motion')
const rotation = ref(0)
const cards = computed(() => props.items.length ? props.items : props.artist ? [{id:props.artist.id,title:props.artist.name,image:props.artist.photo,artists:props.artist}] : [])
const active = computed(() => cards.value[index.value] || cards.value[0])
const story = computed(() => props.artist?.long_bio || active.value?.long_history || active.value?.longHistory || active.value?.inspiration_text || active.value?.inspirationText || active.value?.artists?.long_bio || '')
const visibleCards = computed(() => cards.value.map((art,i) => ({art,i,offset:i-index.value})).filter(card => Math.abs(card.offset) <= 2))
let previousFocus, previousOverflow
function step(delta) { index.value = (index.value + delta + cards.value.length) % cards.value.length }
function keydown(event) {
  if (event.target.matches('input,select,textarea')) return
  if (event.key === 'ArrowRight') { event.preventDefault(); step(1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1) }
}
function pointerMove(event) {
  if (event.pointerType === 'mouse') rotation.value = (event.clientX/window.innerWidth-0.5)*5
}
onMounted(()=>{previousFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.value.showModal();dialog.value.querySelector('.room-close')?.focus()})
onUnmounted(()=>{document.body.style.overflow=previousOverflow;previousFocus?.focus()})
</script>
<template>
  <Teleport to="body"><dialog ref="dialog" class="gallery-room" :class="{'wall-mode':mode==='wall'}" aria-label="Immersive art gallery" @cancel.prevent="emit('close')" @keydown="keydown">
    <div v-if="active && mode==='motion'" class="room-backdrop"><GalleryImage :src="active.image" alt="" eager /></div>
    <header class="room-header"><span>{{ artist ? `${artist.name}’s studio` : 'A closer perspective.' }}</span><div class="room-modes"><button :aria-pressed="mode==='motion'" @click="mode='motion'">In motion</button><button :aria-pressed="mode==='wall'" @click="mode='wall'">On your wall</button></div><button class="room-close" aria-label="Close immersive gallery" @click="emit('close')">Close <span aria-hidden="true">×</span></button></header>
    <div v-if="mode==='motion'" class="room-stage" @pointermove="pointerMove" @pointerleave="rotation=0">
      <div class="floating-deck" :style="{'--tilt':`${rotation}deg`}">
        <button v-for="card in visibleCards" :key="card.art.id" class="floating-card" :class="{'is-active':card.offset===0}" :style="{'--offset':card.offset,'--distance':Math.abs(card.offset),'z-index':10-Math.abs(card.offset)}" :aria-label="`Select ${card.art.title}`" :aria-pressed="card.offset===0" @click="index=card.i"><GalleryImage :src="card.art.image" :alt="card.art.title" eager /><span>{{card.art.title}}</span></button>
      </div>
    </div>
    <WallVisualizer v-else-if="active" :art="active" />
    <footer class="room-footer"><div class="room-story"><p>{{active?.artists?.name || artist?.specialty || active?.category}}</p><MotionText as="h2" :text="active?.title || 'The artist’s perspective'" /><MotionText v-if="story" :text="story" class="room-bio" /><RouterLink v-if="active?.artists?.name && !artist" :to="{name:'artist-detail',params:{name:active.artists.name}}" @click="emit('close')">Meet the artist ↗</RouterLink></div><div class="room-navigation"><button aria-label="Previous artwork" :disabled="cards.length<2" @click="step(-1)">←</button><span aria-live="polite">{{index+1}} / {{cards.length}}</span><button aria-label="Next artwork" :disabled="cards.length<2" @click="step(1)">→</button></div></footer>
  </dialog></Teleport>
</template>
