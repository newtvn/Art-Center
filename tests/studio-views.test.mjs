import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {createSSRApp,h,ref} from 'vue'
import {renderToString} from 'vue/server-renderer'
import {createRouter,createMemoryHistory} from 'vue-router'
const server=await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom',plugins:[{
 name:'studio-test-fixtures',enforce:'pre',
 resolveId(id){if(id.endsWith('/composables/useArtistWorkspace'))return '\0studio-workspace';if(id.endsWith('/composables/useAuctions'))return '\0studio-auctions';if(id.endsWith('/composables/useAuth'))return '\0studio-auth'},
 load(id){if(id==='\0studio-workspace')return 'export const useArtistWorkspace=()=>globalThis.__studioWorkspace';if(id==='\0studio-auctions')return 'export const useAuctions=()=>globalThis.__studioAuctions';if(id==='\0studio-auth')return 'export const useAuth=()=>globalThis.__studioAuth'}
}]})
const views={}
for(const view of ['AdminDashboard','ArtManager','ProfileEditor','AdminLogin'])views[view]=(await server.ssrLoadModule(`/src/views/admin/${view}.vue`)).default
const artwork={id:'piece-a',artist_id:'artist-a',title:'Quiet light',image:'/fixture-image.jpg',category:'Painting',year:'2026',price:1200}
async function render(view,{profile=null,artworks=[],path='/admin/dashboard',problem='',user={id:'artist-a',email:'artist@example.test'}}={}){
 globalThis.__studioWorkspace={profile:ref(profile),artworks:ref(artworks),loading:ref(false),problem:ref(problem),user:ref(user),refresh:()=>{}}
 globalThis.__studioAuctions={auctions:ref([]),now:ref(Date.now()),loading:ref(false),problem:ref(''),refresh:()=>{}}
 globalThis.__studioAuth={user:ref(user),ready:ref(true),signOut:()=>({})}
 const router=createRouter({history:createMemoryHistory(),routes:[{path:'/artists/:name',name:'artist-detail',component:{render:()=>null}},{path:'/:pathMatch(.*)*',component:{render:()=>null}}]})
 await router.push(path);await router.isReady()
 const app=createSSRApp({render:()=>h(views[view])});app.use(router)
 return renderToString(app)
}
test.after(async()=>{await server.close();delete globalThis.__studioWorkspace;delete globalThis.__studioAuctions;delete globalThis.__studioAuth})
test('new artist dashboard shows onboarding without another artist or placeholder portrait',async()=>{
 const html=await render('AdminDashboard')
 assert.match(html,/Every collection starts/);assert.match(html,/Complete your profile/)
 assert.doesNotMatch(html,/via.placeholder|Elas/);assert.equal((html.match(/<img[^>]+>/g)||[]).filter(tag=>!tag.includes('class="brand-logo"')).length,0)
 assert.match(html,/aria-current="page"/)
})
test('dashboard renders owned artwork and a personalized greeting',async()=>{
 const html=await render('AdminDashboard',{profile:{name:'Maya Artist'},artworks:[artwork]})
 assert.match(html,/Welcome back/);assert.match(html,/Maya/);assert.match(html,/Quiet light/)
})
test('workspace errors provide retry rather than claiming the collection is empty',async()=>{
 const html=await render('AdminDashboard',{problem:'Connection failed'})
 assert.match(html,/role="alert"/);assert.match(html,/Try again/);assert.doesNotMatch(html,/Every collection starts/)
})
test('publishing first requires the artist to create their own profile',async()=>{
 const html=await render('ArtManager',{path:'/admin/artworks?new=1'})
 assert.match(html,/Create your profile/);assert.doesNotMatch(html,/id="art-title"/)
})
test('owned artwork opens the complete editor with story fields and auction settings',async()=>{
 const html=await render('ArtManager',{path:'/admin/artworks?edit=piece-a',profile:{name:'Maya'},artworks:[artwork]})
 assert.match(html,/id="art-title"/);assert.match(html,/id="art-story"/);assert.match(html,/id="art-inspiration"/)
 assert.match(html,/Save changes/);assert.match(html,/Set up auction/);assert.match(html,/View in gallery/)
})
test('unknown artwork ids never open an editor for someone else',async()=>{
 const html=await render('ArtManager',{path:'/admin/artworks?edit=not-owned',profile:{name:'Maya'},artworks:[artwork]})
 assert.match(html,/isn’t in your collection/);assert.doesNotMatch(html,/id="art-title"/)
})
test('profile editor has accessible labels, live preview and save action',async()=>{
 const html=await render('ProfileEditor',{path:'/admin/profile',profile:{name:'Maya',specialty:'Painting',long_bio:'A story',socials:{}}})
 for(const field of ['artist-name','artist-medium','artist-bio','artist-instagram','artist-website'])assert.match(html,new RegExp(`for="${field}"`))
 assert.match(html,/Your profile, at a glance/);assert.match(html,/Save profile/);assert.match(html,/View public profile/)
})
test('artist login offers passwordless entry without hiding the password option',async()=>{
 const html=await render('AdminLogin',{path:'/admin/login',user:null})
 assert.match(html,/Email link/);assert.match(html,/Password/);assert.match(html,/Send me a sign-in link/)
 assert.match(html,/autocomplete="email"/);assert.doesNotMatch(html,/Identity|Cipher|Authorized Personnel/)
})
test('upload presents country suggestions, artist ownership and numeric size fields',async()=>{
 const html=await render('ArtManager',{path:'/admin/artworks?new=1',profile:{name:'Maya'},artworks:[]})
 for(const field of ['art-origin','art-artist','art-length','art-width','art-depth']) assert.match(html,new RegExp(`for="${field}"`))
 assert.match(html,/value="Maya"/)
 assert.match(html,/Drawing/)
 assert.match(html,/art-center-logo.png/)
})
test('artist collection offers country, price and length filters',async()=>{
 const html=await render('ArtManager',{path:'/admin/artworks',profile:{name:'Maya'},artworks:[artwork]})
 for(const label of ['Country','Minimum price','Maximum price','Minimum length','Maximum length']) assert.ok(html.includes(label))
})
