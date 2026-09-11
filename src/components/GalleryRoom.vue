<script setup>
import {computed,ref,onMounted,onUnmounted,watch} from 'vue'
import GalleryImage from './GalleryImage.vue'
import MotionText from './MotionText.vue'
const props = defineProps({items:{type:Array,required:true}, artist:Object, initialIndex:{type:Number,default:0}, wall:{type:Boolean,default:false}})
const emit = defineEmits(['close'])
const dialog = ref(null), index = ref(props.initialIndex), mode = ref(props.wall ? 'wall' : 'motion')
const scale = ref(1), x = ref(0), y = ref(0), wallColor = ref('#e8e6e0'), rotation = ref(0)
const cards = computed(() => props.items.length ? props.items : props.artist ? [{id:props.artist.id,title:props.artist.name,image:props.artist.photo,artists:props.artist}] : [])
const active = computed(() => cards.value[index.value] || cards.value[0])
const story = computed(() => props.artist?.long_bio || active.value?.long_history || active.value?.longHistory || active.value?.inspiration_text || active.value?.inspirationText || active.value?.artists?.long_bio || '')
const visibleCards = computed(() => cards.value.map((art,i) => ({art,i,offset:i-index.value})).filter(card => Math.abs(card.offset) <= 2))
let previousFocus, previousOverflow, drag
function step(delta) { index.value = (index.value + delta + cards.value.length) % cards.value.length }
function keydown(event) {
  if (event.target.matches('input,select,textarea')) return
  if (event.key === 'ArrowRight') { event.preventDefault(); step(1) }
  if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1) }
}
function pointerMove(event) {
  if(drag && mode.value === 'wall') {
    x.value = Math.max(-180,Math.min(180,drag.x+event.clientX-drag.startX))
    y.value = Math.max(-140,Math.min(140,drag.y+event.clientY-drag.startY))
  } else if (event.pointerType === 'mouse') rotation.value = (event.clientX/window.innerWidth-0.5)*5
}
function pointerDown(event) { if(mode.value !== 'wall') return; drag = {x:x.value,y:y.value,startX:event.clientX,startY:event.clientY}; event.currentTarget.setPointerCapture(event.pointerId) }
function pointerUp() { drag = null }
watch(index,()=>{x.value=0;y.value=0;scale.value=1})
onMounted(()=>{previousFocus=document.activeElement;previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.value.showModal();dialog.value.querySelector('.room-close')?.focus()})
onUnmounted(()=>{document.body.style.overflow=previousOverflow;previousFocus?.focus()})
</script>
<template>
  <Teleport to="body"><dialog ref="dialog" class="gallery-room" :class="{'wall-mode':mode==='wall'}" aria-label="Immersive art gallery" @cancel.prevent="emit('close')" @keydown="keydown">
    <div v-if="active" class="room-backdrop" :style="mode==='wall' ? {background:wallColor} : {}"><GalleryImage v-if="mode==='motion'" :src="active.image" alt="" eager /></div>
    <header class="room-header"><span>{{ artist ? `${artist.name}’s studio` : 'A closer perspective.' }}</span><div class="room-modes"><button :aria-pressed="mode==='motion'" @click="mode='motion'">In motion</button><button :aria-pressed="mode==='wall'" @click="mode='wall'">On your wall</button></div><button class="room-close" aria-label="Close immersive gallery" @click="emit('close')">Close <span aria-hidden="true">×</span></button></header>
    <div class="room-stage" @pointermove="pointerMove" @pointerleave="rotation=0">
      <div v-if="mode==='motion'" class="floating-deck" :style="{'--tilt':`${rotation}deg`}">
        <button v-for="card in visibleCards" :key="card.art.id" class="floating-card" :class="{'is-active':card.offset===0}" :style="{'--offset':card.offset,'--distance':Math.abs(card.offset),'z-index':10-Math.abs(card.offset)}" :aria-label="`Select ${card.art.title}`" :aria-pressed="card.offset===0" @click="index=card.i"><GalleryImage :src="card.art.image" :alt="card.art.title" eager /><span>{{card.art.title}}</span></button>
      </div>
      <div v-else-if="active" class="wall-art" :style="{transform:`translate(${x}px, ${y}px) scale(${scale})`}" @pointerdown="pointerDown" @pointermove="pointerMove" @pointerup="pointerUp" @pointercancel="pointerUp"><GalleryImage :src="active.image" :alt="active.title" eager /></div>
    </div>
    <div v-if="mode==='wall'" class="wall-controls"><label>Size <input v-model.number="scale" type="range" min="0.5" max="1.5" step="0.05"></label><label>Horizontal <input v-model.number="x" type="range" min="-180" max="180"></label><label>Vertical <input v-model.number="y" type="range" min="-140" max="140"></label><label>Wall colour <input v-model="wallColor" type="color"></label><button @click="x=0;y=0;scale=1">Reset</button></div>
    <footer class="room-footer"><div class="room-story"><p>{{active?.artists?.name || artist?.specialty || active?.category}}</p><MotionText as="h2" :text="active?.title || 'The artist’s perspective'" /><MotionText v-if="story" :text="story" class="room-bio" /><RouterLink v-if="active?.artists?.name && !artist" :to="{name:'artist-detail',params:{name:active.artists.name}}" @click="emit('close')">Meet the artist ↗</RouterLink></div><div class="room-navigation"><button aria-label="Previous artwork" :disabled="cards.length<2" @click="step(-1)">←</button><span aria-live="polite">{{index+1}} / {{cards.length}}</span><button aria-label="Next artwork" :disabled="cards.length<2" @click="step(1)">→</button></div></footer>
  </dialog></Teleport>
</template>
