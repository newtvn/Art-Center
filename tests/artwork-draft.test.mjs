import test from 'node:test'
import assert from 'node:assert/strict'
import {readArtworkDraft,writeArtworkDraft} from '../src/lib/artworkDraft.js'
test('failed publish drafts retain detail text and uploaded image without account identifiers',()=>{
 const values=new Map(),storage={setItem:(key,value)=>values.set(key,value),getItem:key=>values.get(key)}
 const form={title:'Releave',origin:'kansas',price:200,image:'https://example.test/art.jpg',artist_id:'private-id'}
 assert.equal(writeArtworkDraft(storage,'artist-a:new',form),true)
 const restored=readArtworkDraft(storage,'artist-a:new')
 assert.equal(restored.title,'Releave');assert.equal(restored.origin,'kansas');assert.equal(restored.image,form.image)
 assert.equal(restored.artist_id,undefined);assert.deepEqual(readArtworkDraft(storage,'artist-b:new'),{})
})
test('unavailable storage and malformed drafts do not break the editor',()=>{
 assert.equal(writeArtworkDraft({setItem(){throw Error('quota')}},'a',{}),false)
 assert.deepEqual(readArtworkDraft({getItem:()=>'{invalid'},'a'),{})
 assert.deepEqual(readArtworkDraft({getItem:()=>'{"title":{"unsafe":true}}'},'a'),{})
})
