import test from 'node:test'
import assert from 'node:assert/strict'
import {parseDimensions,sizeProblem} from '../src/lib/dimensions.js'
test('legacy sizes populate editable measurements in centimetres',()=>{
 assert.deepEqual(parseDimensions('20 x 30 inches'),{lengthCm:50.8,widthCm:76.2,depthCm:''})
 assert.equal(parseDimensions('60 x 80'),null)
 assert.equal(parseDimensions('0 cm'),null)
})
test('size validation rejects negative measurements and missing preceding dimensions',()=>{
 assert.ok(sizeProblem({lengthCm:-1}))
 assert.ok(sizeProblem({lengthCm:'',widthCm:20}))
 assert.ok(sizeProblem({lengthCm:20,widthCm:'',depthCm:2}))
 assert.equal(sizeProblem({lengthCm:20,widthCm:30,depthCm:''}),'')
 assert.equal(sizeProblem({lengthCm:'',widthCm:'',depthCm:''}),'')
})
