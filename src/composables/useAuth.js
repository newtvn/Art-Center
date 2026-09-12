import { ref, readonly } from 'vue'
import { supabase } from '../lib/supabaseClient'
const user = ref(null), ready = ref(false)
let initialization
function initialize() {
 if (!initialization) {
  supabase.auth.onAuthStateChange((_event, session) => { user.value = session?.user || null; ready.value = true })
  initialization = supabase.auth.getSession().then(({data}) => { user.value = data.session?.user || null }).finally(() => { ready.value = true })
 }
 return initialization
}
export function useAuth() {
 if (typeof window !== 'undefined') initialize().catch(() => {})
 return { user:readonly(user), ready:readonly(ready), initialize, signOut:() => supabase.auth.signOut() }
}
