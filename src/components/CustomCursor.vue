<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const cursor = ref(null)
const follower = ref(null)
const isHovering = ref(false)
const isClicking = ref(false)

const onMouseMove = (e) => {
  // Move the main small cursor instantly
  gsap.to(cursor.value, {
    x: e.clientX,
    y: e.clientY,
    duration: 0,
    ease: 'none'
  })
  
  // Move the follower with lag
  gsap.to(follower.value, {
    x: e.clientX,
    y: e.clientY,
    duration: 0.8,
    ease: 'power3.out'
  })
}

const onMouseDown = () => { isClicking.value = true }
const onMouseUp = () => { isClicking.value = false }

const addHoverListeners = () => {
  const hoverables = document.querySelectorAll('a, button, .cursor-pointer')
  hoverables.forEach(el => {
    el.addEventListener('mouseenter', () => isHovering.value = true)
    el.addEventListener('mouseleave', () => isHovering.value = false)
  })
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mouseup', onMouseUp)
  
  // Re-add listeners periodically or on route change (simple interval for now)
  setInterval(addHoverListeners, 1000)
  addHoverListeners()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mousedown', onMouseDown)
  window.removeEventListener('mouseup', onMouseUp)
})
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-[9999] mix-blend-difference hidden md:block">
    <!-- Main Dot -->
    <div ref="cursor" 
         class="absolute top-0 left-0 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2">
    </div>
    
    <!-- Follower Circle -->
    <div ref="follower" 
         :class="{
            'scale-[3] bg-white/20': isHovering,
            'scale-[0.5]': isClicking
         }"
         class="absolute top-0 left-0 w-8 h-8 border border-white rounded-full -translate-x-1/2 -translate-y-1/2 transition-transform duration-300 ease-out flex items-center justify-center">
    </div>
  </div>
</template>

<style scoped>
/* Ensure the cursor doesn't interfere with clicks */
div {
  pointer-events: none;
}
</style>
