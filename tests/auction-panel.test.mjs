import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {createSSRApp,h,ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {createRouter,createMemoryHistory} from 'vue-router'
const server=await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',plugins:[{
 name:'auction-test-fixtures',enforce:'pre',
 resolveId(id){if(id.endsWith('/composables/useAuctions'))return '\0auction-fixture';if(id.endsWith('/composables/useAuth'))return '\0auth-fixture'},
 load(id){if(id==='\0auction-fixture')return 'export const useAuctions=()=>globalThis.__auctionFixture';if(id==='\0auth-fixture')return 'export const useAuth=()=>globalThis.__authFixture'}
}]})
const {default:Panel}=await server.ssrLoadModule('/src/components/AuctionPanel.vue')
const now=Date.parse('2026-09-11T12:00:00Z')
const auction={artwork_id:'piece',starting_price:100,current_price:110,bid_count:2,bid_increment:5,ends_at:'2026-09-12T12:00:00Z',last_bid_at:'2026-09-11T11:00:00Z'}
async function render({user=null,entry=auction,problem='',loading=false}={}){
 globalThis.__auctionFixture={auctions:ref(entry?[entry]:[]),now:ref(now),problem:ref(problem),loading:ref(loading),refresh:()=>{}}
 globalThis.__authFixture={user:ref(user),ready:ref(true)}
 const router=createRouter({history:createMemoryHistory(),routes:[{path:'/:pathMatch(.*)*',component:{render:()=>null}}]})
 await router.push('/gallery/piece');await router.isReady()
 const app=createSSRApp({render:()=>h(Panel,{art:{id:'piece',artist_id:'artist'}})})
 app.use(router)
 return renderToString(app)
}
test.after(async()=>{await server.close();delete globalThis.__auctionFixture;delete globalThis.__authFixture})
test('visitors see current price, deadline and login link instead of bid input',async()=>{
 const html=await render()
 assert.match(html,/\$110.00/);assert.match(html,/1d 00h 00m 00s/);assert.match(html,/Last bid:/)
 assert.match(html,/\/login\?next=/);assert.match(html,/Sign in to bid/);assert.doesNotMatch(html,/type="number"/)
})
test('signed-in collectors get a minimum-constrained bid form',async()=>{
 const html=await render({user:{id:'collector'}})
 assert.match(html,/min="115"/);assert.match(html,/Place bid/);assert.doesNotMatch(html,/Sign in to bid/)
})
test('artists cannot bid on their own pieces',async()=>{
 const html=await render({user:{id:'artist'}})
 assert.match(html,/This is your piece/);assert.doesNotMatch(html,/type="number"/)
})
test('ended auctions remove the bid form',async()=>{
 const html=await render({user:{id:'collector'},entry:{...auction,ends_at:'2026-09-11T12:00:00Z'}})
 assert.match(html,/Auction ended/);assert.doesNotMatch(html,/type="number"|Sign in to bid/)
})
test('connection failure disables bidding and offers refresh',async()=>{
 const html=await render({user:{id:'collector'},problem:'Bidding is unavailable right now.'})
 assert.match(html,/role="alert"/);assert.match(html,/Refresh bidding/);assert.doesNotMatch(html,/type="number"/)
})
