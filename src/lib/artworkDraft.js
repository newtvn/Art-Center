const fields=['title','category','year','price','dimensions','lengthCm','widthCm','depthCm','origin','long_history','inspiration_text','image']
export function readArtworkDraft(storage,key) {
 try {
  const data=JSON.parse(storage.getItem(key))
  if(!data || typeof data!=='object' || Array.isArray(data))return {}
  return Object.fromEntries(fields.filter(name=>['string','number'].includes(typeof data[name])).map(name=>[name,data[name]]))
 }catch{return {}}
}
export function writeArtworkDraft(storage,key,form) {
 try{storage.setItem(key,JSON.stringify(Object.fromEntries(fields.map(name=>[name,form[name]]))));return true}catch{return false}
}
