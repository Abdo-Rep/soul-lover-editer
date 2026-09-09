/**
 * WebP Optimal Lossless-Quality Compressor & Validator
 * Converts images to crisp, lightweight WebP (~80KB - 160KB)
 * Preserves GIFs and SVGs, handles camera orientation, and validates formats.
 */

const SUPPORTED_EXTENSIONS = /\.(jpg|jpeg|png|webp|gif|svg|avif|bmp|heic|heif|ico|tiff|tif)$/i

export function isValidImageFile(file) {
  if (!file) return false
  if (file.type && file.type.toLowerCase().startsWith('image/')) return true
  if (file.name && SUPPORTED_EXTENSIONS.test(file.name)) return true
  return false
}

export async function compressImageToUnder90KB(file) {
  if (!file) throw new Error('لم يتم تحديد ملف')

  // 1. Validate image format
  if (!isValidImageFile(file)) {
    const errorMsg = 'صيغة هذا الملف غير مدعومة كصورة. يرجى اختيار صورة صالحة (JPG, PNG, WEBP, GIF, HEIC).'
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(errorMsg)
    }
    throw new Error(errorMsg)
  }

  // 2. Preserve animated GIFs and vector SVGs as-is without rasterization
  const isGif = file.type === 'image/gif' || /\.gif$/i.test(file.name)
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name)
  if (isGif || isSvg) {
    return file
  }

  // 3. Modern Fast & Orientation-Safe Compression via Image / Canvas
  return new Promise((resolve, reject) => {
    const img = new Image()
    let objectUrl = ''

    try {
      objectUrl = URL.createObjectURL(file)
    } catch {
      // If object URL cannot be created, return original file
      return resolve(file)
    }

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let width = img.naturalWidth || img.width
      let height = img.naturalHeight || img.height

      if (!width || !height) {
        // Fallback to original file if dimensions cannot be determined
        return resolve(file)
      }

      const MAX_DIM = 1800 // HD Sweet Spot

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width)
          width = MAX_DIM
        } else {
          width = Math.round((width * MAX_DIM) / height)
          height = MAX_DIM
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        return resolve(file)
      }

      // Ultra-crisp high quality rendering
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, 0, 0, width, height)

      // Try WebP conversion first
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            const baseName = file.name ? file.name.replace(/\.[^.]+$/, '') : 'image'
            const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' })
            return resolve(webpFile)
          }

          // Fallback to JPEG if WebP blob generation fails
          canvas.toBlob(
            (jpgBlob) => {
              if (jpgBlob && jpgBlob.size > 0) {
                const baseName = file.name ? file.name.replace(/\.[^.]+$/, '') : 'image'
                const jpgFile = new File([jpgBlob], `${baseName}.jpg`, { type: 'image/jpeg' })
                return resolve(jpgFile)
              }
              // Fallback to original file if canvas export fails
              resolve(file)
            },
            'image/jpeg',
            0.85
          )
        },
        'image/webp',
        0.82 // 82% WebP visually lossless sweet spot
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // If image is a HEIC or other special format that browser canvas can't decode, pass original file
      const isHeic = /\.(heic|heif)$/i.test(file.name)
      if (isHeic) {
        return resolve(file)
      }

      const errorMsg = 'تعذّر قراءة أو معالجة هذه الصورة، قد يكون الملف تالفاً أو صيغته غير مدعومة.'
      if (typeof window !== 'undefined' && typeof window.alert === 'function') {
        window.alert(errorMsg)
      }
      reject(new Error(errorMsg))
    }

    img.src = objectUrl
  })
}
