<script setup>
import {ref,onUnmounted} from 'vue'
const root=ref(null)
let animations=[]
const reduced=()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches
function cancel(){animations.forEach(a=>a.cancel());animations=[]}
function prepare(){cancel();root.value?.querySelectorAll('.paint-band').forEach(el=>{el.style.transform='translateX(0)'})}
async function sweep(out=false){
 cancel()
 const bands=[...(root.value?.querySelectorAll('.paint-band')||[])]
 if(reduced()){bands.forEach(el=>{el.style.transform='translateX(110%)'});return}
 animations=bands.map((el,i)=>{
  const start=out?'0':'-110%', end=out?'110%':'0'
  el.style.transform=`translateX(${end})`
  return el.animate([{transform:`translateX(${start})`},{transform:`translateX(${end})`}],{duration:out?440:260,delay:i*24,easing:'cubic-bezier(.22,1,.36,1)',fill:'backwards'})
 })
 await Promise.all(animations.map(a=>a.finished.catch(()=>{})))
}
onUnmounted(cancel)
defineExpose({cover:()=>sweep(),reveal:()=>sweep(true),prepare})
</script>
<template><div ref="root" class="paint-transition" aria-hidden="true"><div v-for="n in 6" :key="n" class="paint-band" :style="{'--band':n}"><i></i></div></div></template>
