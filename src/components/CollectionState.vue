<script setup>
defineProps({ loading: Boolean, problem: String, title: { type: String, default: 'A little space for something extraordinary.' }, message: { type: String, default: 'The next collection is on its way. Come back soon to discover the work and the people behind it.' } })
defineEmits(['retry'])
</script>
<template>
  <div class="collection-state" :role="problem ? 'alert' : 'status'" :aria-busy="loading">
    <span class="state-symbol" aria-hidden="true">{{ loading ? '◌' : '↗' }}</span>
    <h2>{{ loading ? 'Opening the gallery…' : problem ? 'The collection is taking a moment.' : title }}</h2>
    <p>{{ loading ? 'Making room for a different perspective.' : problem ? 'We can’t display the collection right now. Please try again shortly.' : message }}</p>
    <button v-if="problem" class="pill" @click="$emit('retry')">Try again</button>
    <RouterLink v-else-if="!loading" to="/admin/login" class="text-link">Artist sign-in <span aria-hidden="true">↗</span></RouterLink>
  </div>
</template>
