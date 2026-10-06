import test from 'node:test'
import assert from 'node:assert/strict'
import { categoryList, filterArtworks, collectionProblem, safeExternalUrl } from '../src/lib/gallery.js'

test('categories include uploaded media without dropping familiar sections', () => {
  assert.deepEqual(categoryList([{category:'Ceramics'}, {category:'Photography'}, {category:'Ceramics'}]), ['All', 'Photography', 'Painting', 'Sculpture', 'Digital', 'Mixed Media', 'Canvas', 'Installation', 'Drawing', 'Printmaking', 'Ceramics', 'Textile'])
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

test('country, artist, price and length ranges combine with medium and text search', () => {
  const works = [
    {title:'Light study',category:'Drawing',origin:'Kenya',dimensions:'60 × 80 cm',price:250,artists:{name:'Amina'}},
    {title:'Light study',category:'Drawing',origin:'Uganda',dimensions:'60 × 80 cm',price:250,artists:{name:'Amina'}},
    {title:'Light study',category:'Drawing',origin:'Kenya',dimensions:'20 × 80 cm',price:250,artists:{name:'Amina'}},
    {title:'Light study',category:'Drawing',origin:'Kenya',dimensions:'60 × 80 cm',price:900,artists:{name:'Amina'}},
    {title:'Light study',category:'Drawing',origin:'Kenya',dimensions:'60 × 80 cm',price:250,artists:{name:'Sam'}},
  ]
  assert.deepEqual(filterArtworks(works,'Drawing','light',{country:' kenya ',artist:' AMINA ',minPrice:'200',maxPrice:'300',minLength:'50',maxLength:'60'}),[works[0]])
  assert.deepEqual(filterArtworks(works,'All','uganda'),[works[1]])
})
test('unknown price and size are excluded only when the respective numeric filter is active', () => {
  const works=[{title:'Unknown'},{title:'Free',price:0,dimensions:'10 cm'}]
  assert.equal(filterArtworks(works).length,2)
  assert.deepEqual(filterArtworks(works,'All','',{maxPrice:'0'}),[works[1]])
  assert.deepEqual(filterArtworks(works,'All','',{maxLength:'10'}),[works[1]])
  assert.equal(filterArtworks(works,'All','',{minPrice:'100',maxPrice:'10'}).length,0)
})
test('length filters convert explicit imperial and metric units and ignore unspecified units', () => {
  const works=[{dimensions:'20 × 30 in'},{dimensions:'500 × 600 mm'},{dimensions:'0.5 × 0.6 m'},{dimensions:'50 x 60'},{dimensions:'Variable'}]
  assert.deepEqual(filterArtworks(works,'All','',{minLength:49,maxLength:51}),works.slice(0,3))
})
test('shared search preserves the artist collection search by year',()=>{
 const works=[{title:'Study',year:'2024'},{title:'Study',year:'2026'}]
 assert.deepEqual(filterArtworks(works,'All','2024'),[works[0]])
})
