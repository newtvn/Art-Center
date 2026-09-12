<script setup>
import {ref, onMounted, onUnmounted, watch, nextTick} from 'vue'
import gsap from 'gsap'
const props = defineProps({text: {type:String, default:''}, as: {type:String, default:'p'}})
const element = ref(null)
let observer, tween
function animate() {
  tween?.kill()
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const words = element.value?.querySelectorAll('.motion-word')
  if (words?.length) tween = gsap.fromTo(words, {yPercent:105, rotate:3, opacity:0}, {yPercent:0,rotate:0,opacity:1,duration:0.8,stagger:Math.min(0.028,1.2/words.length),ease:'power3.out',clearProps:'transform,opacity'})
}
onMounted(() => { observer = new IntersectionObserver(entries => { if(entries.some(entry => entry.isIntersecting)){animate();observer.disconnect()} },{threshold:0.1}); observer.observe(element.value) })
watch(() => props.text, async () => {await nextTick();animate()})
onUnmounted(() => {observer?.disconnect();tween?.kill()})
</script>
<template><component :is="as" ref="element" class="motion-text" :aria-label="text"><span v-for="(word,index) in text.split(/\s+/)" :key="index" class="word-mask" aria-hidden="true"><span class="motion-word">{{word}}</span></span></component></template>
