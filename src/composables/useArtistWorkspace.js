import {ref,readonly,watch} from 'vue'
import {useAuth} from './useAuth'
import {supabase} from '../lib/supabaseClient'
import {loadArtistWorkspace} from '../lib/studio'
const profile=ref(null), artworks=ref([]), loading=ref(true), problem=ref('')
let owner=null, request=null, loaded=false, generation=0
export function useArtistWorkspace(){
 const {user}=useAuth()
 async function refresh(force=true){
  const id=user.value?.id
  if(!id)return
  if(owner!==id){owner=id;profile.value=null;artworks.value=[];loaded=false;request=null;generation++}
  if(request)return request
  if(loaded && !force)return
  const version=generation
  loading.value=true;problem.value=''
  request=(async()=>{
   try{
    const data=await loadArtistWorkspace(supabase,id)
    if(user.value?.id!==id || version!==generation)return
    profile.value=data.profile;artworks.value=data.artworks;loaded=true
   }catch{if(version===generation)problem.value='Your studio couldn’t be loaded. Check your connection and try again.'}
   finally{if(version===generation){loading.value=false;request=null}}
  })()
  return request
 }
 watch(()=>user.value?.id,id=>{
  if(id)refresh(false)
  else{generation++;owner=null;loaded=false;request=null;profile.value=null;artworks.value=[];problem.value='';loading.value=true}
 },{immediate:true})
 return {user,profile:readonly(profile),artworks:readonly(artworks),loading:readonly(loading),problem:readonly(problem),refresh}
}
