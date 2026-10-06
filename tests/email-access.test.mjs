import test from 'node:test'
import assert from 'node:assert/strict'
import {emailSignInOptions,emailAccessError,emailCallbackError} from '../src/lib/emailAccess.js'
test('artist production email links use the live site and preserve a safe studio destination',()=>{
 const options=emailSignInOptions('artist','/admin/artworks','https://preview.example',false)
 const url=new URL(options.emailRedirectTo)
 assert.equal(url.origin,'https://art-center.vercel.app')
 assert.equal(url.pathname,'/admin/login')
 assert.equal(url.searchParams.get('next'),'/admin/artworks')
 assert.equal(options.shouldCreateUser,true)
})
test('collector sign-in and signup return to the selected piece',()=>{
 const options=emailSignInOptions('collector','/gallery/piece-a','https://art-center.vercel.app',false)
 const url=new URL(options.emailRedirectTo)
 assert.equal(url.pathname,'/login')
 assert.equal(url.searchParams.get('next'),'/gallery/piece-a')
 assert.equal(options.shouldCreateUser,true)
})
test('external destinations cannot be injected into email callbacks',()=>{
 for(const next of ['//evil.example','https://evil.example','/admin/unknown',null]){
  assert.equal(new URL(emailSignInOptions('artist',next,'https://evil.example',false).emailRedirectTo).searchParams.get('next'),'/admin/dashboard')
 }
 assert.equal(new URL(emailSignInOptions('collector','/admin/dashboard','https://evil.example',false).emailRedirectTo).searchParams.get('next'),'/gallery')
})
test('localhost callbacks are limited to explicit development mode',()=>{
 const dev=new URL(emailSignInOptions('artist',null,'http://127.0.0.1:5173',true).emailRedirectTo)
 assert.equal(dev.origin,'http://127.0.0.1:5173')
 assert.equal(new URL(emailSignInOptions('artist',null,'http://localhost:3000',false).emailRedirectTo).origin,'https://art-center.vercel.app')
 assert.equal(new URL(emailSignInOptions('artist',null,'https://evil.example',true).emailRedirectTo).origin,'https://art-center.vercel.app')
})
test('email limits and expired callback links show actionable safe messages',()=>{
 assert.match(emailAccessError({code:'over_email_send_rate_limit'}),/wait/i)
 assert.match(emailAccessError({status:429}),/wait/i)
 assert.match(emailAccessError({code:'signup_disabled'}),/New accounts/i)
 assert.match(emailCallbackError({hash:'#error=access_denied&error_code=otp_expired',search:''}),/expired/i)
 assert.match(emailCallbackError({hash:'',search:'?error=access_denied'}),/expired/i)
 assert.equal(emailCallbackError({hash:'#access_token=private',search:'?next=/gallery'}),'')
})
test('callback error cleanup preserves a safe return query without retaining error details',async()=>{
 const {clearEmailCallbackError}=await import('../src/lib/emailAccess.js')
 let saved
 clearEmailCallbackError({href:'https://art-center.vercel.app/login?next=%2Fgallery%2Fpiece-a&error=access_denied&error_description=expired#error_code=otp_expired'},{replaceState(_state,_title,url){saved=url}})
 assert.equal(saved,'/login?next=%2Fgallery%2Fpiece-a')
})
