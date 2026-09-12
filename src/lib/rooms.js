export const roomScenes = [
  {
    id: 'living', name: 'Living room', description: 'Oak, linen & afternoon light',
    image: '/rooms/living-room.png', mask: '/rooms/living-room-mask.png',
    center: { x: 62, y: 36 }, hanging: { left: 34, right: 94, top: 8, bottom: 66 },
  },
  {
    id: 'stairs', name: 'Staircase', description: 'A little art along the way',
    image: '/rooms/staircase.png', mask: '/rooms/staircase-mask.png',
    center: { x: 54, y: 32 }, hanging: { left: 20, right: 90, top: 8, bottom: 56 },
  },
]
export const wallPaints = [
  { name: 'Chalk', color: '#ffffff' },
  { name: 'Oat', color: '#e5d8bd' },
  { name: 'Sage', color: '#a9b49b' },
  { name: 'Clay', color: '#c8977d' },
  { name: 'Slate', color: '#879ba9' },
  { name: 'Olive', color: '#737b60' },
]
// Coordinates are percentages of a 3:2 image, not viewport pixels.
export function fitArtwork(scene, aspect = 1, scale = 1) {
  const ratio = Number.isFinite(aspect) && aspect > 0 ? aspect : 1
  let width = 26 * scale
  let height = width * 1.5 / ratio
  const bounds = scene.hanging
  const fit = Math.min(1, (bounds.right - bounds.left - 4) / width, (bounds.bottom - bounds.top - 4) / height)
  return { width: width * fit, height: height * fit }
}
export function clampPlacement(scene, position, size) {
  const bounds = scene.hanging
  return {
    x: Math.max(bounds.left + size.width / 2, Math.min(bounds.right - size.width / 2, position.x)),
    y: Math.max(bounds.top + size.height / 2, Math.min(bounds.bottom - size.height / 2, position.y)),
  }
}
