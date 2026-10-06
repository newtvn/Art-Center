import {safeReturnPath} from './auctions.js'
import {studioReturnPath} from './studio.js'

const productionOrigin='https://art-center.vercel.app'
export function emailSignInOptions(kind,next,origin,development=false) {
 let base=productionOrigin
 if(development){
  try {
   const url=new URL(origin)
   if(['localhost','127.0.0.1','[::1]'].includes(url.hostname) && ['http:','https:'].includes(url.protocol))base=url.origin
  }catch{}
 }
 const artist=kind==='artist'
 const callback=new URL(artist?'/admin/login':'/login',base)
 callback.searchParams.set('next',artist?studioReturnPath(next):safeReturnPath(next))
 return {emailRedirectTo:callback.href,shouldCreateUser:true}
}
export function emailAccessError(error) {
 if(error?.status===429 || ['over_email_send_rate_limit','over_request_rate_limit'].includes(error?.code))return 'Please wait a minute before requesting another email link. Check your inbox and spam folder for the latest one.'
 if(error?.code==='signup_disabled')return 'New accounts aren’t available right now. Please try again later, or sign in with an existing account.'
 if(error?.code==='email_address_invalid')return 'Enter a valid email address and try again.'
 return 'We couldn’t send your email link. Check your email address and connection, then try again.'
}
export function emailCallbackError({hash='',search=''}) {
 const params=[new URLSearchParams(hash.replace(/^#/,'')),new URLSearchParams(search.replace(/^\?/,''))]
 return params.some(value=>value.has('error') || value.has('error_code'))?'That email link has expired or has already been used. Request a new link below and open the latest email.':''
}
export function clearEmailCallbackError(location,history) {
 const url=new URL(location.href)
 for(const key of ['error','error_code','error_description'])url.searchParams.delete(key)
 history.replaceState(null,'',url.pathname+url.search)
}
