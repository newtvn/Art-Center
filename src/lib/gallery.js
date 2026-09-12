export const mediaCategories = ['Photography', 'Painting', 'Sculpture', 'Digital', 'Mixed Media', 'Canvas', 'Installation']
export function categoryList(artworks = []) {
  return ['All', ...new Set([...mediaCategories, ...artworks.map(art => art.category?.trim()).filter(Boolean)])]
}
export function filterArtworks(artworks, category = 'All', search = '') {
  const term = search.trim().toLocaleLowerCase()
  return artworks.filter(art => (category === 'All' || art.category === category) &&
    [art.title, art.artists?.name, art.category].filter(Boolean).join(' ').toLocaleLowerCase().includes(term))
}
export function collectionProblem(error) {
  if (!error) return null
  return ['PGRST205', 'PGRST200', '42P01'].includes(error.code) ? 'setup' : 'connection'
}
export function safeExternalUrl(value) {
  try { const url = new URL(value); return ['https:', 'http:'].includes(url.protocol) ? url.href : '' } catch { return '' }
}
