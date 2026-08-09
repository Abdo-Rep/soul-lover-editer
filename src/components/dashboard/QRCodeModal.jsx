import { useState, useRef, useEffect } from 'react'
import { QrCode, Download, Copy, Check, X, Heart, Type } from 'lucide-react'
import { useContent } from '../../context/ContentContext'
import { drawQRCodeToCanvas } from '../../utils/qrCodeGenerator'

// Lightweight Instant Local QR Code Generator (Matrix renderer with central heart logo)
export default function QRCodeModal({ isOpen, onClose, slug }) {
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(false)
  const canvasRef = useRef(null)
  const { content, t } = useContent() || {}

  const activeSlug = slug || 'default'
  const siteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/${activeSlug}`
    : `https://soulove.me/${activeSlug}`

  // Default custom text for client
  const initialText = (content?.siteName && content.siteName !== 'saraش')
    ? content.siteName
    : (content?.language === 'es' ? 'Un regalo de mi corazón 💖' : content?.language === 'en' ? 'A gift from my heart 💖' : 'هدية من قلبي 💖')

  const [customText, setCustomText] = useState(initialText)

  useEffect(() => {
    if (content?.siteName && content.siteName !== 'saraش') {
      setCustomText(content.siteName)
    }
  }, [content?.siteName])

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return

    try {
      drawQRCodeToCanvas(canvasRef.current, siteUrl, {
        color: '#be123c',
        backgroundColor: '#ffffff',
        margin: 20,
        centerHeart: true,
        customText: customText.trim(),
        customTextColor: '#9f1239',
      })
    } catch (e) {
      console.error('QR generation error:', e)
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

  const isRtl = content?.language !== 'es' && content?.language !== 'en' && content?.language !== 'en-GB'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <div className="relative w-full max-w-sm rounded-3xl border border-rose-100 bg-white p-6 shadow-2xl text-center">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100 transition ${isRtl ? 'left-4' : 'right-4'}`}
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="mb-3">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white shadow-md shadow-rose-200">
            <QrCode size={24} />
          </div>
          <h3 className="text-lg font-bold text-rose-950 flex items-center justify-center gap-1.5">
            {t?.qrCodeTitle || 'كود الـ QR الخاص بموقعك'} <Heart size={18} className="text-rose-500 fill-rose-500" />
          </h3>
        </div>

        {/* Custom Text Input for Client */}
        <div className={`mb-3 ${isRtl ? 'text-right' : 'text-left'}`}>
          <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-rose-700">
            <Type size={13} className="text-rose-400" />
            {t?.customTextUnderCode || 'النص المكتوب تحت الكود (للطباعة):'}
          </label>
          <input
            type="text"
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            placeholder={content?.language === 'es' ? 'Ejemplo: Un regalo de mi corazón 💖' : content?.language === 'en' ? 'Example: A gift from my heart 💖' : 'اكتب اسم العميل أو الرسالة (مثال: هدية من قلبي)'}
            className={`w-full rounded-xl border border-rose-200 bg-rose-50/40 px-3 py-2 text-xs font-medium text-rose-900 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 ${isRtl ? 'text-right' : 'text-left'}`}
            maxLength={40}
          />
        </div>

        {/* Canvas QR Code Display */}
        <div className="relative mx-auto mb-3 flex w-fit items-center justify-center rounded-2xl border-2 border-rose-100 bg-white p-2.5 shadow-inner">
          <canvas ref={canvasRef} className="h-64 w-60 rounded-xl" />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDownloadQR}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-rose-200 transition hover:brightness-105 active:scale-95 cursor-pointer"
          >
            <Download size={15} />
            {t?.downloadHD || 'تحميل كود HD'}
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-50 transition active:scale-95 cursor-pointer"
          >
            {copied ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
            {copied ? (t?.copied || 'تم النسخ!') : (t?.copyLink || 'نسخ الرابط')}
          </button>
        </div>
      </div>
    </div>
  )
}
