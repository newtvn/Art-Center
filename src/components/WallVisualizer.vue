<script setup>
import { computed, ref, watch } from 'vue'
import GalleryImage from './GalleryImage.vue'
import { roomScenes, wallPaints, fitArtwork, clampPlacement } from '../lib/rooms'

const props = defineProps({ art: { type: Object, required: true } })
const sceneId = ref('living')
const scene = computed(() => roomScenes.find(room => room.id === sceneId.value))
const paint = ref('#ffffff')
const paintName = computed(() => wallPaints.find(item => item.color === paint.value)?.name || 'Custom')
const frame = ref('oak')
const scale = ref(1)
const aspect = ref(1)
const position = ref({ ...scene.value.center })
const surface = ref(null)
const imageFailed = ref(false)
const size = computed(() => fitArtwork(scene.value, aspect.value, scale.value))
const boundedPosition = computed(() => clampPlacement(scene.value, position.value, size.value))
const artworkStyle = computed(() => ({
  left: `${boundedPosition.value.x}%`, top: `${boundedPosition.value.y}%`,
  width: `${size.value.width}%`, height: `${size.value.height}%`,
}))
let drag = null
function resetPlacement() { scale.value = 1; position.value = { ...scene.value.center } }
function resetRoom() { resetPlacement(); paint.value = '#ffffff'; frame.value = 'oak' }
function startDrag(event) {
  if (event.button !== 0) return
  event.preventDefault()
  drag = { x: event.clientX, y: event.clientY, position: { ...boundedPosition.value } }
  event.currentTarget.setPointerCapture(event.pointerId)
}
function moveDrag(event) {
  if (!drag || !surface.value) return
  const bounds = surface.value.getBoundingClientRect()
  position.value = clampPlacement(scene.value, {
    x: drag.position.x + (event.clientX - drag.x) / bounds.width * 100,
    y: drag.position.y + (event.clientY - drag.y) / bounds.height * 100,
  }, size.value)
}
function moveWithKey(event) {
  const moves = { ArrowLeft: [-1,0], ArrowRight: [1,0], ArrowUp: [0,-1], ArrowDown: [0,1] }
  if (!moves[event.key]) return
  event.preventDefault()
  event.stopPropagation()
  const [dx,dy] = moves[event.key]
  position.value = clampPlacement(scene.value, {x: boundedPosition.value.x + dx, y: boundedPosition.value.y + dy}, size.value)
}
function readAspect(event) {
  const img = event.target
  if (img.naturalWidth && img.naturalHeight) aspect.value = img.naturalWidth / img.naturalHeight
}
watch(sceneId, () => { resetPlacement(); imageFailed.value = false })
watch(() => props.art.id, () => { aspect.value = 1; resetPlacement() })
watch(size, () => { position.value = clampPlacement(scene.value, position.value, size.value) })
</script>

<template>
  <section class="wall-visualizer" aria-label="Furnished room preview">
    <div class="room-photo-area">
      <div ref="surface" class="room-photo-surface" :data-scene="sceneId">
        <img :key="scene.id" :src="scene.image" :alt="`${scene.name}: ${scene.description}`" class="interior-photo" @error="imageFailed = true">
        <div v-if="!imageFailed" class="wall-paint-layer" :style="{ backgroundColor: paint, maskImage: `url(${scene.mask})`, WebkitMaskImage: `url(${scene.mask})` }" aria-hidden="true"></div>
        <p v-if="imageFailed" class="room-image-error">This room couldn’t load. Please choose another room.</p>
        <div v-else class="placed-artwork" :class="`frame-${frame}`" :style="artworkStyle" tabindex="0" role="group" :aria-label="`${art.title}. Drag to position, or use arrow keys.`" @pointerdown="startDrag" @pointermove="moveDrag" @pointerup="drag = null" @pointercancel="drag = null" @lostpointercapture="drag = null" @keydown="moveWithKey">
          <div class="artwork-mount"><GalleryImage :src="art.image" :alt="art.title" eager @load="readAspect" /></div>
        </div>
        <span v-if="!imageFailed" class="room-placement-hint">Drag the artwork to find its place</span>
      </div>
      <p class="room-preview-caption">{{ scene.description }} <span>Room preview · proportions are illustrative</span></p>
    </div>

    <aside class="room-customizer" aria-label="Customize your room">
      <div class="customizer-heading"><h2>Make yourself at home.</h2><p>Find the setting that feels like you.</p></div>
      <fieldset class="room-picker"><legend>Choose a space</legend><div class="room-thumbnails"><button v-for="room in roomScenes" :key="room.id" :aria-pressed="sceneId === room.id" @click="sceneId = room.id"><img :src="room.image" alt=""><span>{{ room.name }}</span></button></div></fieldset>
      <fieldset class="paint-picker"><legend>Wall colour <span>{{ paintName }}</span></legend><div class="paint-swatches"><button v-for="swatch in wallPaints" :key="swatch.name" :style="{backgroundColor:swatch.color}" :aria-label="`${swatch.name} wall colour`" :aria-pressed="paint === swatch.color" @click="paint = swatch.color"><span v-if="paint === swatch.color" aria-hidden="true">✓</span></button></div><label class="custom-paint"><input v-model="paint" type="color" aria-label="Custom wall colour"><span>Find your own shade</span></label></fieldset>
      <fieldset class="frame-picker"><legend>The finishing touch</legend><div><button v-for="item in ['oak','black','white','none']" :key="item" :aria-pressed="frame === item" @click="frame = item">{{ item === 'none' ? 'No frame' : item }}</button></div></fieldset>
      <label class="artwork-size">Artwork size <span>{{ Math.round(scale * 100) }}%</span><input v-model.number="scale" type="range" min="0.5" max="1.5" step="0.05"></label>
      <div class="placement-sliders"><label>Left / right<input v-model.number="position.x" type="range" :min="scene.hanging.left + size.width/2" :max="scene.hanging.right - size.width/2" step="0.5"></label><label>Up / down<input v-model.number="position.y" type="range" :min="scene.hanging.top + size.height/2" :max="scene.hanging.bottom - size.height/2" step="0.5"></label></div>
      <button class="room-reset" @click="resetRoom">Reset this room ↺</button>
    </aside>
  </section>
</template>
