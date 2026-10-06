<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctions } from '../composables/useAuctions'
import { useAuth } from '../composables/useAuth'
import { money } from '../lib/auctions'
import { checkoutMode } from '../lib/checkout'
import { myTopBid, startCheckout } from '../lib/payments'
const props = defineProps({ art: { type: Object, required: true } })
const route = useRoute(), { auctions, now } = useAuctions(), { user, ready } = useAuth()
const auction = computed(() => auctions.value.find(a => a.artwork_id === props.art.id))
const mode = computed(() => checkoutMode(props.art, auction.value, now.value))
const isOwner = computed(() => user.value?.id === props.art.artist_id)
const winner = ref(false), busy = ref(false), error = ref('')
watch([mode, user], async () => {
  winner.value = false
  if (mode.value !== 'auction' || !user.value) return
  const top = await myTopBid(props.art.id).catch(() => null)
  winner.value = top != null && Math.abs(top - Number(auction.value.current_price)) < 0.005
}, { immediate: true })
const amount = computed(() => mode.value === 'auction' ? auction.value?.current_price : props.art.price)
async function pay() {
  if (busy.value) return
  busy.value = true; error.value = ''
  try { window.location.assign((await startCheckout(props.art.id, mode.value)).redirectUrl) }
  catch (failure) { error.value = failure.message; busy.value = false }
}
</script>
<template>
 <section v-if="art.sold_at || (mode && !isOwner && (mode === 'purchase' || winner || !user))" class="purchase-panel" aria-label="Purchase">
  <p v-if="art.sold_at" class="section-intro" role="status">Sold</p>
  <template v-else-if="mode === 'purchase'">
   <div class="auction-price"><span>Price</span><strong>{{ money(amount) }}</strong><small>USD</small></div>
   <button v-if="user" class="pill" :disabled="busy" @click="pay">{{ busy ? 'Opening Pesapal…' : 'Buy now' }} <span aria-hidden="true">↗</span></button>
   <RouterLink v-else-if="ready" :to="{ path: '/login', query: { next: route.path } }" class="pill">Sign in to buy <span aria-hidden="true">↗</span></RouterLink>
  </template>
  <template v-else-if="mode === 'auction' && winner">
   <div class="auction-price"><span>You won at</span><strong>{{ money(amount) }}</strong><small>USD</small></div>
   <button class="pill" :disabled="busy" @click="pay">{{ busy ? 'Opening Pesapal…' : 'Pay for your win' }} <span aria-hidden="true">↗</span></button>
  </template>
  <p v-if="mode" class="form-hint">Secure payment by card or mobile money through Pesapal.</p>
  <p v-if="error" role="alert" class="form-error">{{ error }}</p>
 </section>
</template>
