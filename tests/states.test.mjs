import test from 'node:test'
import assert from 'node:assert/strict'
import {createServer} from 'vite'
import {createSSRApp,h} from 'vue'
import {renderToString} from 'vue/server-renderer'

const server = await createServer({optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false,ws:false},appType:'custom'})
const {default:CollectionState} = await server.ssrLoadModule('/src/components/CollectionState.vue')
async function render(props) {
  const app=createSSRApp({render:()=>h(CollectionState,props)})
  app.component('RouterLink',{props:['to'],setup:(props,{slots})=>()=>h('a',{href:props.to},slots.default?.())})
  return renderToString(app)
}
test.after(async()=>{await server.close()})
test('missing tables give visitors a retry rather than a fake collection',async()=>{
  const html=await render({problem:'setup'})
  assert.match(html,/role="alert"/)
  assert.match(html,/Try again/)
  assert.doesNotMatch(html,/<img|Supabase|PGRST205/)
})
test('empty collection provides a route to the artist space',async()=>{
  const html=await render({loading:false})
  assert.match(html,/href="\/admin\/login"/)
  assert.match(html,/The next collection is on its way/)
  assert.doesNotMatch(html,/Try again|<img/)
})
test('loading state does not incorrectly claim content is missing',async()=>{
  const html=await render({loading:true})
  assert.match(html,/aria-busy="true"/)
  assert.match(html,/Opening the gallery/)
  assert.doesNotMatch(html,/not found|Artist sign-in/)
})
