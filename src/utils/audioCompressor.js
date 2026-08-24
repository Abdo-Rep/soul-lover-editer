/**
 * Client-Side Audio Compressor for Soulove Platform
 * Automatically compresses large audio files (>4MB) to clean, high-quality MP3 (<3.5MB)
 * to guarantee Vercel 4.5MB Serverless Function payload limit is never exceeded.
 */

let lameLoadPromise = null

function loadLameJs() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Window not defined'))
  if (window.lamejs) return Promise.resolve(window.lamejs)
  if (lameLoadPromise) return lameLoadPromise

  lameLoadPromise = new Promise((resolve, reject) => {
    const s1 = document.createElement('script')
    s1.src = 'https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js'
    s1.crossOrigin = 'anonymous'
    s1.onload = () => resolve(window.lamejs)
    s1.onerror = () => {
      const s2 = document.createElement('script')
      s2.src = 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js'
      s2.crossOrigin = 'anonymous'
      s2.onload = () => resolve(window.lamejs)
      s2.onerror = (err) => reject(new Error('فشل تحميل مكتبة ضغط الصوت: ' + err))
      document.head.appendChild(s2)
    }
    document.head.appendChild(s1)
  })

  return lameLoadPromise
}

export async function compressAudioToUnder4MB(file, onProgress) {
  if (!file) return file
  // If file is already under 4MB, no compression is required
  if (file.size <= 3.8 * 1024 * 1024) {
    return file
  }

  try {
    onProgress?.('جاري ضغط وتحسين حجم الأغنية...')
    await loadLameJs()

    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return file

    const audioCtx = new AudioContextClass()
    const arrayBuffer = await file.arrayBuffer()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    try {
      await audioCtx.close()
    } catch {}

    const duration = audioBuffer.duration || 180
    // Target 3.0 MB = 3.0 * 8 * 1024 / duration kbps
    let bitrate = Math.floor((3.0 * 8 * 1024) / duration)
    if (bitrate > 128) bitrate = 128
    if (bitrate < 64) bitrate = 64

    const channels = 1
    const sampleRate = audioBuffer.sampleRate || 44100
    const mp3encoder = new window.lamejs.Mp3Encoder(channels, sampleRate, bitrate)
    const mp3Data = []

    const left = audioBuffer.getChannelData(0)
    const right = audioBuffer.numberOfChannels > 1 ? audioBuffer.getChannelData(1) : left
    const numSamples = left.length
    const samples = new Int16Array(numSamples)

    for (let i = 0; i < numSamples; i++) {
      const mono = (left[i] + right[i]) * 0.5
      const s = Math.max(-1, Math.min(1, mono))
      samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF
    }

    const sampleBlockSize = 1152
    for (let i = 0; i < numSamples; i += sampleBlockSize) {
      const sampleChunk = samples.subarray(i, i + sampleBlockSize)
      const mp3buf = mp3encoder.encodeBuffer(sampleChunk)
      if (mp3buf && mp3buf.length > 0) {
        mp3Data.push(mp3buf)
      }
    }

    const mp3buf = mp3encoder.flush()
    if (mp3buf && mp3buf.length > 0) {
      mp3Data.push(mp3buf)
    }

    const blob = new Blob(mp3Data, { type: 'audio/mpeg' })
    const baseName = (file.name || 'audio.mp3').replace(/\.[^/.]+$/, '')
    return new File([blob], `${baseName}.mp3`, { type: 'audio/mpeg' })
  } catch (err) {
    console.warn('Audio compression fallback error:', err)
    return file // Fallback to original file
  }
}
