<script setup>
defineProps({label:{type:String,default:'Bringing the next page to life…'}})
</script>
<template><div class="paint-loader" role="status"><svg viewBox="0 0 240 74" aria-hidden="true"><path class="paint-trail" d="M18 26 C60 8 168 42 220 22 M218 42 C152 64 66 26 22 48 M32 61 L192 59"/><g class="paint-brush"><path d="M0 0L40-25Q47-27 44-19L9 11Z" fill="#b07646"/><path d="M-3 1L8 12L-2 23L-15 11Z" fill="#88877b"/><path d="M-15 11L-2 23L-15 34L-18 29L-23 35L-23 26L-29 29Z" fill="currentColor"/></g></svg><span>{{label}}</span></div></template>
