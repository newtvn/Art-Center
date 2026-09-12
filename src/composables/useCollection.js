import { computed, ref, readonly } from 'vue'
import { supabase } from '../lib/supabaseClient'
import { categoryList, collectionProblem } from '../lib/gallery'
const artworks = ref([])
const artists = ref([])
const loading = ref(true)
const problem = ref(null)
let request
let loaded = false
async function refresh() {
  if (request) return request
  loading.value = true
  problem.value = null
  request = (async () => {
    try {
      const results = await Promise.all([
        supabase.from('artworks').select('*, artists(*)').order('title').abortSignal(AbortSignal.timeout(12000)),
        supabase.from('artists').select('*').order('name').abortSignal(AbortSignal.timeout(12000)),
      ])
      artworks.value = results[0].data || []
      artists.value = results[1].data || []
      problem.value = collectionProblem(results.find(result => result.error)?.error)
    } catch (error) { problem.value = collectionProblem(error) }
    finally { loading.value = false; loaded = true; request = null }
  })()
  return request
}
export function useCollection() {
  if (!loaded && !request) refresh()
  return { artworks: readonly(artworks), artists: readonly(artists), loading: readonly(loading), problem: readonly(problem), categories: computed(() => categoryList(artworks.value)), refresh }
}
