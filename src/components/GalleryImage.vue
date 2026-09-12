<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ src: String, alt: { type: String, default: '' }, eager: Boolean })
const failed = ref(false)
watch(() => props.src, () => { failed.value = false })
</script>
<template>
  <img v-if="src && !failed" :src="src" :alt="alt" :loading="eager ? 'eager' : 'lazy'" decoding="async" @error="failed = true" />
  <span v-else class="image-unavailable" role="img" :aria-label="alt || 'Image unavailable'"><span aria-hidden="true">↗</span><small>Image unavailable</small></span>
</template>
