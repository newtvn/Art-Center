<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import PaintLoader from '../components/PaintLoader.vue'
import { orderLabels, returnReference } from '../lib/checkout'
import { verifyOrder } from '../lib/payments'
const route = useRoute(), reference = returnReference(route.query)
const order = ref(null), problem = ref(reference ? '' : 'We couldn’t find this payment. Return to the gallery to continue.')
let timer, attempts = 0
async function check() {
  try { order.value = await verifyOrder(reference); problem.value = '' }
  catch (failure) { problem.value = failure.message }
  if ((!order.value || order.value.status === 'pending') && ++attempts < 20) timer = setTimeout(check, 3000)
}
onMounted(() => { if (reference) check() })
onUnmounted(() => clearTimeout(timer))
</script>
<template>
 <section class="page-shell checkout-return">
  <p v-if="problem && !order" role="alert" class="form-error">{{ problem }}</p>
  <PaintLoader v-else-if="!order" label="Confirming your payment…" />
  <template v-else>
   <h1 role="status">{{ (orderLabels[order.status] || orderLabels.pending)[0] }}</h1>
   <p>{{ (orderLabels[order.status] || orderLabels.pending)[1] }}</p>
   <p class="form-hint">Order reference {{ order.orderId }}</p>
   <RouterLink :to="order.status === 'completed' ? '/gallery' : { name: 'art-detail', params: { id: order.artworkId } }" class="pill">{{ order.status === 'completed' ? 'Back to the gallery' : 'Back to the artwork' }} <span aria-hidden="true">↗</span></RouterLink>
  </template>
 </section>
</template>
