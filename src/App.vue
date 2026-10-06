<script setup>
import BrandLogo from './components/BrandLogo.vue'
import { computed, nextTick, ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCollection } from './composables/useCollection'
import PaintTransition from './components/PaintTransition.vue'
import { useAuth } from './composables/useAuth'
const { user, signOut } = useAuth()
const paint = ref(null)
async function leavePage(_el, done) { try { await paint.value?.cover() } finally { done() } }
async function enterPage(_el, done) { try { await paint.value?.reveal() } finally { done() } }
const route = useRoute()
const { categories, refresh } = useCollection()
const isAdmin = computed(() => route.path.startsWith('/admin'))
const menuOpen = ref(false)
const menuButton = ref(null)
const menuPanel = ref(null)
async function closeMenu(returnFocus = false) {
  menuOpen.value = false
  if (returnFocus) { await nextTick(); menuButton.value?.focus() }
}
function outside(event) { if (!menuPanel.value?.contains(event.target) && !menuButton.value?.contains(event.target)) closeMenu() }
function escape(event) { if (event.key === 'Escape' && menuOpen.value) closeMenu(true) }
watch(() => route.fullPath, (to, from) => {
  closeMenu()
  if (from?.startsWith('/admin') && !to.startsWith('/admin')) refresh()
})
watch(menuOpen, async value => { if (value) { await nextTick(); menuPanel.value?.querySelector('a')?.focus() } })
onMounted(() => { document.addEventListener('pointerdown', outside); document.addEventListener('keydown', escape) })
onUnmounted(() => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) })
</script>
<template>
  <a class="skip-link" href="#main">Skip to content</a>
  <header v-if="!isAdmin" class="site-header">
    <RouterLink to="/" class="brand" aria-label="Art Center home"><BrandLogo /></RouterLink>
    <div class="header-note">Independent art. Shared everywhere.</div>
    <button ref="menuButton" class="menu-toggle" :aria-expanded="menuOpen" aria-controls="site-menu" :aria-label="menuOpen ? 'Close menu' : 'Open menu'" @click="menuOpen = !menuOpen"><span>{{ menuOpen ? 'Close' : 'Menu' }}</span><i :class="{open:menuOpen}" aria-hidden="true"><b></b><b></b></i></button>
    <Transition name="menu">
      <nav v-if="menuOpen" id="site-menu" ref="menuPanel" class="menu-panel" aria-label="Main navigation" @focusout="event => { if (event.relatedTarget && !menuPanel?.contains(event.relatedTarget) && event.relatedTarget !== menuButton) closeMenu() }">
        <RouterLink to="/" class="menu-primary">Home <span>↗</span></RouterLink>
        <RouterLink to="/gallery" class="menu-primary">The gallery <span>↗</span></RouterLink>
        <div class="menu-categories"><RouterLink v-for="category in categories.slice(1)" :key="category" :to="{name:'gallery', query:{category}}">{{ category }}</RouterLink></div>
        <RouterLink to="/artists" class="menu-primary">The artists <span>↗</span></RouterLink>
        <RouterLink v-if="!user" to="/login" class="menu-primary">Collector sign-in / sign-up <span>↗</span></RouterLink>
        <button v-else class="menu-studio" @click="signOut">Sign out</button>
        <RouterLink to="/admin/login" class="menu-studio">Artist sign-in / sign-up <span>↗</span></RouterLink>
      </nav>
    </Transition>
  </header>
  <PaintTransition ref="paint" />
  <main id="main" tabindex="-1"><RouterView v-slot="{ Component }"><Transition :css="false" mode="out-in" appear @before-enter="paint?.prepare()" @leave="leavePage" @enter="enterPage"><component :is="Component" :key="route.path" /></Transition></RouterView></main>
  <footer v-if="!isAdmin" class="site-footer"><RouterLink to="/" class="footer-brand"><BrandLogo /><span>Art has a way<br>of bringing us together.</span></RouterLink><div><RouterLink to="/gallery">Explore the gallery</RouterLink><RouterLink to="/artists">Meet the artists</RouterLink><RouterLink to="/admin/login">Your artist space</RouterLink></div><p>Art Center © {{ new Date().getFullYear() }}<br>A space for every perspective.</p></footer>
</template>
