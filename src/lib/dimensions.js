// The first measurement is length; older entries are used only with explicit units.
export function parseDimensions(value) {
  const match = String(value || '').trim().match(/^(\d+(?:\.\d+)?)(?:\s*[×xX]\s*(\d+(?:\.\d+)?))?(?:\s*[×xX]\s*(\d+(?:\.\d+)?))?\s*(cm|mm|m|in|inch|inches|\")$/i)
  if (!match) return null
  const scale = {cm:1, mm:0.1, m:100, in:2.54, inch:2.54, inches:2.54, '"':2.54}[match[4].toLowerCase()]
  const numbers = match.slice(1,4).map(value => value == null ? '' : Math.round(Number(value)*scale*10000)/10000)
  if (numbers.some(value => value !== '' && (!Number.isFinite(value) || value <= 0))) return null
  return {lengthCm:numbers[0], widthCm:numbers[1], depthCm:numbers[2]}
}
export function dimensionsText(form) {
  if (form.lengthCm === '' || form.lengthCm == null) return String(form.dimensions || '').trim()
  return [form.lengthCm,form.widthCm,form.depthCm].filter(value => value !== '' && value != null).map(Number).join(' × ') + ' cm'
}
export function sizeProblem(form) {
  const values = [form.lengthCm,form.widthCm,form.depthCm]
  if (values.some(value => value !== '' && value != null && (!Number.isFinite(Number(value)) || Number(value) <= 0))) return 'Enter measurements greater than zero, or leave the size blank.'
  if ((form.lengthCm === '' || form.lengthCm == null) && values.slice(1).some(value => value !== '' && value != null)) return 'Add the length before entering width or depth.'
  if ((form.widthCm === '' || form.widthCm == null) && form.depthCm !== '' && form.depthCm != null) return 'Add the width before entering depth.'
  return ''
}
