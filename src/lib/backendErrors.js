export function isMissingSchema(error) {
 return ['42703','42P01','PGRST204','PGRST205'].includes(error?.code)
}
export function auctionRetryAt(error, failures, now = Date.now()) {
 return isMissingSchema(error) ? Infinity : now + Math.min(60000, 10000 * 2 ** Math.min(6, Math.max(0, failures-1)))
}
export function artworkSaveMessage(error) {
 if(isMissingSchema(error))return 'The gallery needs a database update before this artwork can be published. Your details are kept in this tab. Please try again after the update.'
 if(error?.code==='42501')return 'Your account does not have permission to save this artwork. Sign in with the artist account that owns it.'
 if(error?.code==='23503')return 'Your artist profile could not be found. Save your profile before publishing artwork.'
 return 'Your artwork couldn’t be saved. Your details are kept in this tab—check your connection and try again.'
}
export async function checkArtworkSchema(client) {
 const {error}=await client.from('artworks').select('origin,long_history,inspiration_text').limit(0).abortSignal(AbortSignal.timeout(10000))
 if(error)throw error
}
