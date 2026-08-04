import { useState, useRef, useEffect } from 'react'
import { QrCode, Download, Copy, Check, X, Heart, Type } from 'lucide-react'
import { useContent } from '../../context/ContentContext'

// Lightweight QR Code Generator (Matrix renderer with central heart logo)
export default function QRCodeModal({ isOpen, onClose, slug }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const canvasRef = useRef(null)
  const { content } = useContent() || {}

  const activeSlug = slug || 'default'
  const siteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${activeSlug}`
    : `https://soulove.me/${activeSlug}`

  // Default custom text for client (in Arabic)
  const initialText = (content?.siteName && content.siteName !== 'saraش')
    ? content.siteName
    : 'هدية من قلبي 💖'

  const [customText, setCustomText] = useState(initialText)

  useEffect(() => {
    if (content?.siteName && content.siteName !== 'saraش') {
      setCustomText(content.siteName)
    }
  }, [content?.siteName])

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    setLoading(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const width = 340
    const height = 360
    canvas.width = width
    canvas.height = height

    // Draw soft white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    const padding = 20
    const qrSize = width - padding * 2

    const img = new Image()
    img.crossOrigin = 'anonymous'
    // Call the public QR code API with deep rose styling color
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&color=be123c&data=${encodeURIComponent(siteUrl)}`
    
    img.onload = () => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)

      // Draw standard scannable QR code
      ctx.drawImage(img, padding, padding, qrSize, qrSize)

      // Draw Center Heart Badge
      ctx.fillStyle = '#FFFFFF'
      ctx.beginPath()
      ctx.arc(width / 2, padding + qrSize / 2, 28, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = '#f43f5e'
      ctx.lineWidth = 3
      ctx.stroke()

      // Heart Icon in center
      ctx.fillStyle = '#e11d48'
      ctx.font = '28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('♥', width / 2, padding + qrSize / 2 + 1)

      // Draw Custom Text under the QR Code
      if (customText.trim()) {
        ctx.fillStyle = '#9f1239'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'top'
        ctx.fillText(customText.trim(), width / 2, padding + qrSize + 14)
      }
      setLoading(false)
    }

    img.onerror = () => {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = '#ef4444'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('فشل تحميل الكود، يرجى المحاولة لاحقاً', width / 2, height / 2)
      setLoading(false)
    }
  }, [isOpen, siteUrl, customText])

  if (!isOpen) return null

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(siteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  const handleDownloadQR = () => {
    if (!canvasRef.current) return
    const link = document.createElement('a')
    link.download = `soulove-qr-${activeSlug}.png`
    link.href = canvasRef.current.toDataURL('image/png')
    link.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      dir="rtl"
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="mb-3">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-md shadow-rose-200">
            <QrCode size={24} />
          </div>
          <h3 className="text-lg font-bold text-rose-950 flex items-center justify-center gap-1.5">
            كود الـ QR الخاص بموقعك <Heart size={18} className="text-rose-500 fill-rose-500" />
          </h3>
        </div>

        {/* Custom Text Input for Client */}
        <div className="mb-3 text-right">
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-rose-700">
            <Type size={13} className="text-rose-400" />
            النص المكتوب تحت الكود (للطباعة):
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder="اكتب اسم العميل أو الرسالة (مثال: هدية من قلبي)"
            className="w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2 text-xs font-medium text-rose-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 text-right"
            maxLength={40}
          />
        </div>

        {/* Canvas QR Code Display */}
        <div className="relative mx-auto mb-3 flex w-fit items-center justify-center rounded-2xl border-2 border-rose-100 bg-white p-2.5 shadow-inner">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
            </div>
          )}
          <canvas ref={canvasRef} className="h-64 w-60 rounded-xl" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:brightness-105 active:scale-95"
          >
            <Download size={15} />
            تحميل كود HD
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition active:scale-95"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            {copied ? 'تم النسخ!' : 'نسخ الرابط'}
          </button>
        </div>
      </div>
    </div>
  )
}
