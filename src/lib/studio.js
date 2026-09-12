export async function loadArtistWorkspace(client, id) {
 if (!id) throw new Error('Sign in to open your studio.')
 const results = await Promise.all([
  client.from('artists').select('*').eq('id',id).maybeSingle().abortSignal(AbortSignal.timeout(12000)),
  client.from('artworks').select('*').eq('artist_id',id).order('title').abortSignal(AbortSignal.timeout(12000)),
 ])
 const failure=results.find(result=>result.error)?.error
 if(failure) throw failure
 return {profile:results[0].data || null,artworks:results[1].data || []}
}
export function imageProblem(file) {
 if(!file || !['image/jpeg','image/png','image/webp'].includes(file.type))return 'Choose a JPG, PNG or WebP image.'
 if(!file.size || file.size>10*1024*1024)return 'Choose an image smaller than 10 MB.'
 return ''
}
export function artworkPayload(form, artistId, image) {
 const text=value=>String(value || '').trim()
 return {artist_id:artistId,title:text(form.title),image,price:form.price==='' || form.price==null?null:Number(form.price),year:text(form.year),category:text(form.category),dimensions:text(form.dimensions),origin:text(form.origin),long_history:text(form.long_history),inspiration_text:text(form.inspiration_text)}
}
export function profileProgress(profile) {
 return [{label:'Add your name',done:!!profile?.name?.trim()},{label:'Choose a portrait',done:!!profile?.photo},{label:'Share your medium',done:!!profile?.specialty?.trim()},{label:'Tell your story',done:!!profile?.long_bio?.trim()}]
}
export function studioReturnPath(path) {
 return ['/admin/dashboard','/admin/artworks','/admin/profile'].includes(path)?path:'/admin/dashboard'
}
export async function uploadStudioImage(client, userId, file) {
 const problem=imageProblem(file)
 if(problem) throw new Error(problem)
 const extension={'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[file.type]
 const path=`${userId}/${crypto.randomUUID()}.${extension}`
 const {error}=await client.storage.from('art-center-assets').upload(path,file,{contentType:file.type})
 if(error)throw error
 const {data}=client.storage.from('art-center-assets').getPublicUrl(path)
 return data.publicUrl
}
