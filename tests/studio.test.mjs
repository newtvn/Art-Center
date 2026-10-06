import test from 'node:test'
import assert from 'node:assert/strict'
import {loadArtistWorkspace, imageProblem, artworkPayload, profileProgress, studioReturnPath} from '../src/lib/studio.js'
test('workspace requests only the signed-in artist and their own artwork',async()=>{
 const calls=[]
 const client={from(table){const q={select(){return q},eq(key,value){calls.push([table,key,value]);return q},order(){return q},maybeSingle(){return q},abortSignal(){return Promise.resolve({data:table==='artists'?null:[],error:null})}};return q}}
 assert.deepEqual(await loadArtistWorkspace(client,'artist-a'),{profile:null,artworks:[]})
 assert.deepEqual(calls,[['artists','id','artist-a'],['artworks','artist_id','artist-a']])
})
test('workspace never hides a failed request behind an empty collection',async()=>{
 const client={from(){const q={select(){return q},eq(){return q},order(){return q},maybeSingle(){return q},abortSignal(){return Promise.resolve({error:new Error('offline')})}};return q}}
 await assert.rejects(loadArtistWorkspace(client,'a'),/offline/)
})
test('image selection rejects oversized and unsupported uploads',()=>{
 assert.equal(imageProblem({type:'image/jpeg',size:1024}),'')
 assert.ok(imageProblem({type:'image/svg+xml',size:1024}))
 assert.ok(imageProblem({type:'image/png',size:11*1024*1024}))
 assert.ok(imageProblem({type:'image/png',size:0}))
})
test('artwork payload preserves zero price, trims copy and includes story fields',()=>{
 const result=artworkPayload({title:' Study ',price:'0',year:'2026',category:'Painting',long_history:' A story ',inspiration_text:' Light ',origin:' Nairobi ',dimensions:' 20 × 30 cm '},'artist-a','image.jpg')
 assert.equal(result.artist_id,'artist-a');assert.equal(result.price,0);assert.equal(result.title,'Study');assert.equal(result.long_history,'A story');assert.equal(result.origin,'Nairobi')
 assert.equal(artworkPayload({title:'a',price:''},'a','b').price,null)
})
test('profile checklist reflects actual information',()=>{
 assert.equal(profileProgress(null).filter(item=>item.done).length,0)
 assert.equal(profileProgress({name:'A',photo:'x',specialty:'Painting',long_bio:'story'}).every(item=>item.done),true)
})
test('studio login redirects stay inside supported artist routes',()=>{
 assert.equal(studioReturnPath('/admin/artworks'),'/admin/artworks')
 for(const value of ['//evil.test','https://evil.test','/admin/login','/admin/unknown',null])assert.equal(studioReturnPath(value),'/admin/dashboard')
})

test('upload length, width and depth are saved as searchable centimetre dimensions',()=>{
 const result=artworkPayload({title:'Study',origin:' Kenya ',lengthCm:'60',widthCm:'80',depthCm:'2',dimensions:'old size'},'artist-a','image.jpg')
 assert.equal(result.dimensions,'60 × 80 × 2 cm')
 assert.equal(result.origin,'Kenya')
 assert.equal(artworkPayload({title:'Digital',lengthCm:'',dimensions:'Variable'},'a','b').dimensions,'Variable')
})
