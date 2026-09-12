<script setup>
import {computed,ref,watch} from 'vue'
import {supabase} from '../lib/supabaseClient'
import {useAuctions} from '../composables/useAuctions'
import {money} from '../lib/auctions'
import PaintLoader from './PaintLoader.vue'
const props=defineProps({art:{type:Object,required:true}})
const {auctions,loading,problem,refresh}=useAuctions()
const auction=computed(()=>auctions.value.find(a=>a.artwork_id===props.art.id))
const open=ref(false), price=ref(''), increment=ref('1'), end=ref(''), busy=ref(false), error=ref(''), message=ref('')
watch(open,value=>{if(value){price.value=auction.value?.starting_price||props.art.price||'';increment.value=auction.value?.bid_increment||1;const deadline=auction.value?.ends_at;if(deadline){const d=new Date(deadline);end.value=new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}}})
async function save(){
 if(busy.value) return
 error.value='';message.value=''
 if(!end.value || !Number.isFinite(Date.parse(end.value)) || Date.parse(end.value)<=Date.now()){error.value='Choose a closing time in the future.';return}
 busy.value=true
 try{
  const {error:failure}=await supabase.rpc('configure_auction',{p_artwork_id:props.art.id,p_starting_price:Number(price.value),p_bid_increment:Number(increment.value),p_ends_at:new Date(end.value).toISOString()})
  if(failure) throw failure
  await refresh();open.value=false;message.value='Auction saved. Collectors can now bid on this piece.'
 }catch(failure){error.value=failure.code==='P0001'?failure.message:'The auction couldn’t be saved. Your settings are still here. Please try again shortly.'}
 finally{busy.value=false}
}
</script>
<template><div class="auction-settings" @click.stop>
 <p v-if="auction" class="form-hint">{{money(auction.current_price)}} · {{auction.bid_count}} bids · Closes {{new Date(auction.ends_at).toLocaleString()}}</p>
 <button v-if="!auction?.bid_count" class="text-link" :disabled="loading || !!problem" @click="open=!open">{{open?'Close settings':auction?'Edit auction':'Set up auction'}} ↗</button>
 <p v-else class="form-hint">Auction terms are locked because bidding has started.</p>
 <p v-if="problem" class="form-error">Bidding isn’t available right now. Your artwork can stay in the gallery while you <button class="text-link" @click="refresh">retry</button>.</p>
 <form v-if="open" class="auction-settings-form" @submit.prevent="save"><label>Starting price (USD)<input v-model="price" type="number" min="0.01" max="9999999999.99" step="0.01" required></label><label>Minimum increment (USD)<input v-model="increment" type="number" min="0.01" max="9999999999.99" step="0.01" required></label><label>Closing date & time<input v-model="end" type="datetime-local" required></label><p class="form-hint">Your local time zone: {{Intl.DateTimeFormat().resolvedOptions().timeZone}}. Bidding opens when saved. Terms lock after the first bid.</p><button class="pill" :disabled="busy">{{busy?'Saving…':'Save auction'}}</button></form>
 <PaintLoader v-if="busy" label="Preparing your auction…"/><p v-if="error" class="form-error" role="alert">{{error}}</p><p v-if="message" class="form-success" role="status">{{message}}</p>
</div></template>
