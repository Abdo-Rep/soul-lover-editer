const DEFAULT_MAX_WIDTH = 1200
const DEFAULT_QUALITY = 0.82

export async function compressImageFile(
  file,
  { maxWidth = DEFAULT_MAX_WIDTH, quality = DEFAULT_QUALITY } = {},
) {
  if (!file.type?.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error('فشل ضغط الصورة'))),
      'image/webp',
      quality,
    )
  })

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.webp`, { type: 'image/webp' })
}
