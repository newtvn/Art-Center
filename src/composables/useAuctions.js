import { ref, readonly, onMounted, onUnmounted } from 'vue'
import { auctionRetryAt, isMissingSchema } from '../lib/backendErrors'
import { supabase } from '../lib/supabaseClient'
const auctions = ref([]), loading = ref(true), problem = ref(''), now = ref(Date.now())
let users = 0, poll, clock, request, failures = 0, nextAttempt = 0
async function refresh() {
 if (request) return request
 request = (async () => {
  try {
   const {data,error} = await supabase.from('auctions').select('*').abortSignal(AbortSignal.timeout(10000))
   if (error) throw error
   auctions.value = data || []; problem.value = ''; failures = 0; nextAttempt = 0
  } catch (error) {
   nextAttempt = auctionRetryAt(error, ++failures)
   problem.value = isMissingSchema(error) ? 'Auctions haven’t been enabled yet. Please check back soon.' : 'Bidding is unavailable right now. Please try again shortly.'
  }
  finally {loading.value = false; request = null}
 })()
 return request
}
export function useAuctions() {
 onMounted(() => {
  if (++users === 1) {
   now.value = Date.now()
   if (Date.now() >= nextAttempt) refresh()
   poll = setInterval(() => {if (!document.hidden && Date.now() >= nextAttempt) refresh()}, 10000)
   clock = setInterval(() => {now.value = Date.now()}, 1000)
  }
 })
 onUnmounted(() => {if (--users === 0) {clearInterval(poll); clearInterval(clock)}})
 return {auctions:readonly(auctions), loading:readonly(loading), problem:readonly(problem), now:readonly(now), refresh}
}
