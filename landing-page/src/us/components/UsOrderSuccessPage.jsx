import React, { useEffect, useState } from 'react'
import { CheckCircle2, Heart, Sparkles, ArrowRight, ShieldCheck, Mail, Gift, ExternalLink } from 'lucide-react'
import {
  getLandingDataUs,
  trackPixelPurchaseUs,
  sendMetaConversionsApiEventUs,
} from '../../data/landingStoreUs'

export default function UsOrderSuccessPage({ orderId, onBackHome, pricing = {} }) {
  const [capiStatus, setCapiStatus] = useState('sending') // sending, sent, skipped
  const data = getLandingDataUs()
  const price = pricing.price || '19.99'

  useEffect(() => {
    // 1. Scroll to top on render
    window.scrollTo(0, 0)

    // 2. 🎯 Trigger Browser Pixel Purchase Event in USD ($)
    trackPixelPurchaseUs(
      {
        id: orderId || 'US_' + Date.now().toString(),
        package: pricing.packageName || 'The Complete VIP Love Sanctuary 👑',
      },
      price
    )

    // 3. 🚀 Trigger Server-side Conversions API (CAPI) in USD ($)
    if (data.pixels?.metaPixelId && data.pixels?.metaCapiToken) {
      sendMetaConversionsApiEventUs({
        eventName: 'Purchase',
        orderData: {
          id: orderId || 'US_' + Date.now().toString(),
          package: pricing.packageName || 'The Complete VIP Love Sanctuary 👑',
        },
        price: price,
        pixelConfig: data.pixels,
      })
        .then((res) => {
          if (res?.success) {
            setCapiStatus('sent')
          } else {
            setCapiStatus('skipped')
          }
        })
        .catch(() => setCapiStatus('skipped'))
    } else {
      setCapiStatus('skipped')
    }
  }, [orderId, data.pixels, price, pricing.packageName])

  return (
    <div
      className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center p-4 selection:bg-[#ff3b68] selection:text-white"
      dir="ltr"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0f142d] border-2 border-[#ff3b68]/40 shadow-2xl space-y-6 text-center">
        {/* Animated Celebration Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-25"
            style={{ background: '#ff3b68' }}
          />
          <div
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#ff3b68]/40"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
            }}
          >
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
            <Sparkles size={13} />
            <span>Order Confirmed Successfully 🎉</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Thank You for Your Order! 💖
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            Your personalized couples sanctuary is now being created by our design team!
          </p>
        </div>

        {/* Order Details Card */}
        <div className="p-4 rounded-2xl bg-[#070913] border border-white/10 space-y-2.5 text-left text-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span>Order Reference:</span>
            <span className="font-mono text-white font-bold">{orderId || 'US_ORDER_RECENT'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Delivery Time:</span>
            <span className="text-emerald-400 font-bold">Under 15-30 Minutes ⚡</span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Status:</span>
            <span className="text-amber-300 font-bold">Processing in Studio 🎨</span>
          </div>
        </div>

        {/* Delivery Instructions */}
        <div className="p-4 rounded-2xl bg-[#12183b] border border-blue-500/30 text-left space-y-2">
          <h3 className="text-xs font-extrabold text-blue-300 flex items-center gap-1.5">
            <Mail size={14} />
            <span>What happens next?</span>
          </h3>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            1. You will receive an email shortly with your private website link and password.<br />
            2. You'll receive a high-res printable luxury QR gift card ready to print or share!<br />
            3. You can reply to our email with your pictures and special song anytime.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onBackHome}
            className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ArrowRight size={14} />
            <span>Return to Homepage</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>100% Guaranteed Romantic Experience</span>
        </div>
      </div>
    </div>
  )
}
