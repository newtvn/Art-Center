import test from 'node:test'
import assert from 'node:assert/strict'
import {isMissingSchema,auctionRetryAt,artworkSaveMessage,checkArtworkSchema} from '../src/lib/backendErrors.js'
test('missing tables and columns are classified separately from connection failures',()=>{
 for(const code of ['42703','42P01','PGRST204','PGRST205'])assert.equal(isMissingSchema({code}),true)
 for(const code of ['42501','23503','23502','500'])assert.equal(isMissingSchema({code}),false)
})
test('missing auction table suspends automatic polling until manual retry',()=>{
 assert.equal(auctionRetryAt({code:'PGRST205'},1,1000),Infinity)
 assert.equal(auctionRetryAt({code:'42P01'},8,1000),Infinity)
 assert.equal(auctionRetryAt({code:'FETCH_ERROR'},1,1000),11000)
 assert.equal(auctionRetryAt({code:'FETCH_ERROR'},2,1000),21000)
 assert.equal(auctionRetryAt({code:'FETCH_ERROR'},9,1000),61000)
})
test('schema failures never tell artists to check their internet connection',()=>{
 assert.match(artworkSaveMessage({code:'PGRST204'}),/database update/)
 assert.doesNotMatch(artworkSaveMessage({code:'PGRST204'}),/connection/)
 assert.match(artworkSaveMessage({code:'42501'}),/permission/)
 assert.match(artworkSaveMessage({code:'23503'}),/profile/)
})
test('schema check is read-only and preserves the underlying error',async()=>{
 let selected,limit
 const query={select(fields){selected=fields;return query},limit(n){limit=n;return query},abortSignal(){return Promise.resolve({error:{code:'42703',message:'column missing'}})}}
 const client={from(table){assert.equal(table,'artworks');return query}}
 await assert.rejects(checkArtworkSchema(client),error=>error.code==='42703')
 assert.equal(selected,'origin,long_history,inspiration_text');assert.equal(limit,0)
})
