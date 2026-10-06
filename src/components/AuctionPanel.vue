<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuctions } from '../composables/useAuctions'
import { useAuth } from '../composables/useAuth'
import { supabase } from '../lib/supabaseClient'
import { countdown, minimumBid, money, bidProblem } from '../lib/auctions'
import PaintLoader from './PaintLoader.vue'
const props=defineProps({art:{type:Object,required:true}})
const route=useRoute(), {auctions,loading,problem,now,refresh}=useAuctions(), {user,ready}=useAuth()
const auction=computed(()=>auctions.value.find(a=>a.artwork_id===props.art.id))
const ended=computed(()=>auction.value && Date.parse(auction.value.ends_at)<=now.value)
const amount=ref(''), busy=ref(false), error=ref(''), message=ref('')
const date=value=>new Date(value).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'long'})
async function bid() {
 if(busy.value || !user.value || problem.value) return
 error.value=bidProblem(amount.value,auction.value); message.value=''
 if(error.value) return
 busy.value=true
 try {
  const {error:failure}=await supabase.rpc('place_bid',{p_artwork_id:props.art.id,p_amount:Number(amount.value)})
  if(failure) throw failure
  message.value=`Your bid of ${money(amount.value)} was placed.`; amount.value=''
 } catch(failure) {error.value=failure.code==='P0001'?failure.message:'We couldn’t confirm your bid. Refresh the current price before trying again.'}
 finally {await refresh();busy.value=false}
}
</script>
<template>
 <section class="auction-panel" aria-label="Artwork bidding">
  <PaintLoader v-if="loading" label="Checking the auction…"/>
  <template v-else-if="auction">
   <div class="auction-heading"><span class="section-intro">{{ended?'Bidding closed':'Open for bidding'}}</span><span>{{auction.bid_count}} {{auction.bid_count===1?'bid':'bids'}}</span></div>
   <div class="auction-price"><span>{{auction.bid_count ? (ended?'Final bid':'Current bid'):'Starting price'}}</span><strong>{{money(auction.current_price)}}</strong><small>USD</small></div>
   <div class="auction-clock"><span>{{ended?'Time is up':'Time remaining'}}</span><strong :role="ended?'status':undefined">{{countdown(auction.ends_at,now)}}</strong></div>
   <p class="auction-date">{{ended?'Closed':'Closes'}} <time :datetime="auction.ends_at">{{date(auction.ends_at)}}</time></p>
   <p class="auction-date">{{auction.last_bid_at?'Last bid: '+date(auction.last_bid_at):'Be the first to place a bid.'}}</p>
   <template v-if="!ended && !problem && !art.sold_at">
    <p v-if="user?.id===art.artist_id" class="form-hint">This is your piece. Collectors can bid until the closing time.</p>
    <form v-else-if="user" @submit.prevent="bid" class="bid-form"><label :for="'bid-'+art.id">Your bid (USD)</label><div class="bid-entry"><input :id="'bid-'+art.id" v-model="amount" type="number" inputmode="decimal" :min="minimumBid(auction)" step="0.01" max="9999999999.99" :placeholder="minimumBid(auction).toFixed(2)" required :disabled="busy"><button class="pill" :disabled="busy">{{busy?'Placing…':'Place bid'}} ↗</button></div><p class="form-hint">Minimum {{money(minimumBid(auction))}} · Increment {{money(auction.bid_increment)}}</p></form>
    <RouterLink v-else-if="ready" :to="{path:'/login',query:{next:route.path}}" class="pill">Sign in to bid <span aria-hidden="true">↗</span></RouterLink>
    <p class="form-hint">Bids are binding. The winner pays securely through Pesapal after the auction closes.</p>
   </template>
   <p v-else-if="ended" class="form-hint">{{auction.bid_count?'Bidding has finished.':'This auction ended without any bids.'}}</p>
   <PaintLoader v-if="busy" label="Placing your bid…"/>
   <p v-if="error" role="alert" class="form-error">{{error}}</p><p v-if="message" role="status" class="form-success">{{message}}</p>
  </template>
  <p v-else-if="!problem" class="form-hint">This piece is not currently up for auction.</p>
  <div v-if="problem" role="alert"><p class="form-error">{{problem}}</p><button class="text-link" @click="refresh">Refresh bidding ↗</button></div>
 </section>
</template>
