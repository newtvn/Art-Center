import {parseDimensions} from './dimensions.js'

export const mediaCategories = ['Photography', 'Painting', 'Sculpture', 'Digital', 'Mixed Media', 'Canvas', 'Installation', 'Drawing', 'Printmaking', 'Ceramics', 'Textile']
export function categoryList(artworks = []) {
  return ['All', ...new Set([...mediaCategories, ...artworks.map(art => art.category?.trim()).filter(Boolean)])]
}
const normalized = value => String(value || '').trim().toLocaleLowerCase()
function bound(value) {
  return value !== '' && value != null && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null
}
function inRange(value, min, max) {
  const low = bound(min), high = bound(max)
  if (low == null && high == null) return true
  if (value == null || value === '' || !Number.isFinite(Number(value))) return false
  return (low == null || Number(value) >= low) && (high == null || Number(value) <= high)
}
export function filterArtworks(artworks, category = 'All', search = '', filters = {}) {
  const term = normalized(search), country = normalized(filters.country), artist = normalized(filters.artist)
  return artworks.filter(art => (category === 'All' || art.category === category) &&
    normalized([art.title, art.artists?.name, art.category, art.year, art.origin, art.dimensions].filter(Boolean).join(' ')).includes(term) &&
    normalized(art.origin).includes(country) && normalized(art.artists?.name).includes(artist) &&
    inRange(art.price, filters.minPrice, filters.maxPrice) &&
    inRange(parseDimensions(art.dimensions)?.lengthCm, filters.minLength, filters.maxLength))
}
export function collectionProblem(error) {
  if (!error) return null
  return ['PGRST205', 'PGRST200', '42P01'].includes(error.code) ? 'setup' : 'connection'
}
export function safeExternalUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' } catch { return '' }
}
