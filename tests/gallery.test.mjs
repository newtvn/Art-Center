import test from 'node:test'
import assert from 'node:assert/strict'
import { categoryList, filterArtworks, collectionProblem, safeExternalUrl } from '../src/lib/gallery.js'

test('categories include uploaded media without dropping familiar sections', () => {
  assert.deepEqual(categoryList([{category:'Ceramics'}, {category:'Photography'}, {category:'Ceramics'}]), ['All', 'Photography', 'Painting', 'Sculpture', 'Digital', 'Mixed Media', 'Canvas', 'Installation', 'Ceramics'])
})
test('category and search jointly filter original records', () => {
  const works = [{ title:'Blue hour', category:'Photography', artists:{name:'Amina'} }, {title:'Blue clay', category:'Sculpture', artists:{name:'Amina'}}]
  assert.deepEqual(filterArtworks(works, 'Photography', 'amina'), [works[0]])
  assert.equal(filterArtworks(works, 'All', 'absent').length, 0)
  assert.equal(filterArtworks([{title:null}], 'All', 'blue').length, 0)
})
test('missing schema is distinguished from a connection failure', () => {
  assert.equal(collectionProblem({code:'PGRST205'}), 'setup')
  assert.equal(collectionProblem({code:'42P01'}), 'setup')
  assert.equal(collectionProblem(new Error('offline')), 'connection')
  assert.equal(collectionProblem(null), null)
})
test('artist links allow web URLs only', () => {
  assert.equal(safeExternalUrl('javascript:alert(1)'), '')
  assert.equal(safeExternalUrl('https://artist.example/studio'), 'https://artist.example/studio')
  assert.equal(safeExternalUrl(undefined), '')
})
