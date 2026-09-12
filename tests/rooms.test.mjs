import test from 'node:test'
import assert from 'node:assert/strict'
import {roomScenes, fitArtwork, clampPlacement} from '../src/lib/rooms.js'

test('portrait and landscape works stay within the hanging area in both scenes',()=>{
 for(const scene of roomScenes){
  for(const aspect of [0.3,0.7,1,2,4]){
   const size=fitArtwork(scene,aspect,1.5)
   const point=clampPlacement(scene,{x:-100,y:200},size)
   assert.ok(point.x-size.width/2>=scene.hanging.left-0.001)
   assert.ok(point.x+size.width/2<=scene.hanging.right+0.001)
   assert.ok(point.y-size.height/2>=scene.hanging.top-0.001)
   assert.ok(point.y+size.height/2<=scene.hanging.bottom+0.001)
   assert.ok(Math.abs(size.width/size.height*1.5-aspect)<0.001)
  }
 }
})
test('changing artwork size preserves its centre when it fits',()=>{
 const scene=roomScenes[0], size=fitArtwork(scene,1,1)
 assert.deepEqual(clampPlacement(scene,scene.center,size),scene.center)
})
