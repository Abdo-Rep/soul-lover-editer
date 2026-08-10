import React, { useState, useEffect } from 'react'
import { Heart, Gift, ShieldCheck, MessageCircle } from 'lucide-react'
import Hero from './components/Hero'
import FeatureShowcase from './components/FeatureShowcase'
import PhonePreview from './components/PhonePreview'
import Steps from './components/Steps'
import Pricing from './components/Pricing'
import Reviews from './components/Reviews'
import FAQ from './components/FAQ'
import Footer from './components/Footer'
import OrderModal from './components/OrderModal'
import AdminDashboard from './components/AdminDashboard'
import OrderSuccessPage from './components/OrderSuccessPage'
import { getLandingData, initMetaPixel, syncFromSupabase } from './data/landingStore'

export default function App({ initialRoute }) {
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (initialRoute) return initialRoute
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const path = window.location.pathname || ''
      if (
        hash.startsWith('#order-success') ||
        hash.startsWith('#thank-you') ||
        path === '/order-success' ||
        path === '/thank-you' ||
        path === '/landing/success'
      ) {
        return 'success'
      }
      if (hash === '#admin' || path === '/admin' || path === '/landing/admin' || path === '/landing-admin') {
        return 'admin'
      }
    }
    return 'home'
  })

  const [currentOrderId, setCurrentOrderId] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const match = hash.match(/id=([^&]+)/)
      return match ? match[1] : null
    }
    return null
  })

  const [landingData, setLandingData] = useState(getLandingData())
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(
    landingData.pricing?.packageName || 'باقة الحب المتكاملة VIP 👑'
  )

  // Sync latest data from Supabase on boot
  useEffect(() => {
    syncFromSupabase().then(() => {
      const fresh = getLandingData()
      setLandingData(fresh)
      if (fresh.pixels?.metaPixelId) {
        initMetaPixel(fresh.pixels.metaPixelId)
      }
    })
  }, [])

  // Initialize Meta Pixel on startup if configured
  useEffect(() => {
    if (landingData.pixels?.metaPixelId) {
      initMetaPixel(landingData.pixels.metaPixelId)
    }
  }, [landingData.pixels?.metaPixelId])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || ''
      const path = window.location.pathname || ''

      if (
        hash.startsWith('#order-success') ||
        hash.startsWith('#thank-you') ||
        path === '/order-success' ||
        path === '/thank-you' ||
        path === '/landing/success'
      ) {
        const match = hash.match(/id=([^&]+)/)
        if (match) setCurrentOrderId(match[1])
        setCurrentRoute('success')
      } else if (hash === '#admin' || path === '/admin' || path === '/landing/admin' || path === '/landing-admin') {
        setCurrentRoute('admin')
      } else {
        setCurrentRoute('home')
      }

      const freshData = getLandingData()
      setLandingData(freshData)
      if (freshData.pixels?.metaPixelId) {
        initMetaPixel(freshData.pixels.metaPixelId)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleOpenOrder = (pkgName) => {
    if (typeof pkgName === 'string') setSelectedPackage(pkgName)
    else setSelectedPackage(landingData.pricing?.packageName || 'باقة الحب المتكاملة VIP 👑')
    setIsOrderModalOpen(true)
  }

  const handleOrderSuccess = (orderId) => {
    setCurrentOrderId(orderId)
    window.location.hash = `#order-success?id=${orderId}`
    setCurrentRoute('success')
  }

  const handleScrollToDemo = () => {
    const el = document.getElementById('demo-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScrollToPricing = () => {
    const el = document.getElementById('pricing-section')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  const openAdmin = () => {
    window.location.pathname = '/landing/admin'
  }

  const exitAdmin = () => {
    window.location.pathname = '/landing'
    setCurrentRoute('home')
  }

  const backHomeFromSuccess = () => {
    window.location.hash = ''
    window.location.pathname = '/landing'
    setCurrentRoute('home')
  }

  // 1. Admin Dashboard View
  if (currentRoute === 'admin') {
    return <AdminDashboard onExitAdmin={exitAdmin} />
  }

  // 2. Dedicated Standalone Purchase / Order Success Page for Meta Pixel Purchase Tracking!
  if (currentRoute === 'success') {
    return (
      <OrderSuccessPage
        orderId={currentOrderId}
        onBackHome={backHomeFromSuccess}
        pricing={landingData.pricing}
      />
    )
  }

  // 3. Main Landing Page View (Mobile-First Architecture)
  return (
    <div
      className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between selection:bg-[#ff3b68] selection:text-white pb-20 sm:pb-0"
      dir="rtl"
      style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
    >
      {/* 🧭 Top Navigation Bar */}
      <nav className="fixed top-0 inset-x-0 z-40 bg-[#070913]/90 backdrop-blur-xl border-b border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff758c 100%)',
                boxShadow: '0 4px 12px rgba(255, 59, 104, 0.4)',
              }}
            >
              <Heart size={16} fill="currentColor" />
            </div>
            <span className="text-lg font-black text-white tracking-wide">
              Soulove <span className="text-[#ff3b68]">💖</span>
            </span>
          </a>

          {/* Top Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openAdmin}
              className="p-2 rounded-xl bg-[#131836] border border-white/10 text-slate-400 hover:text-white transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
              title="لوحة التحكم"
            >
              <ShieldCheck size={15} />
              <span className="text-[11px]">لوحة التحكم</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenOrder()}
              className="px-3.5 py-1.5 rounded-xl text-white font-black text-xs flex items-center gap-1 cursor-pointer shadow-md active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(255, 59, 104, 0.4)',
                border: 'none',
              }}
            >
              <Gift size={13} />
              <span>اطلب الآن 🚀</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 🚀 Main Page Content (Mobile-First Centered Container) */}
      <main className="flex-1 w-full max-w-lg mx-auto space-y-2">
        <Hero
          hero={landingData.hero}
          onOpenOrder={handleOpenOrder}
          onScrollToDemo={handleScrollToDemo}
        />
        <FeatureShowcase
          featuresSection={landingData.featuresSection}
        />
        <PhonePreview
          demo={landingData.demo}
          onOpenOrder={handleOpenOrder}
        />
        <Steps
          stepsSection={landingData.stepsSection}
        />
        <Pricing
          pricing={landingData.pricing}
          onOpenOrder={handleOpenOrder}
        />
        <Reviews
          reviewsSection={landingData.reviewsSection}
        />
        <FAQ
          faqsSection={landingData.faqsSection}
        />
      </main>

      {/* 🔻 Footer */}
      <Footer onOpenOrder={handleOpenOrder} />

      {/* 📱 Sticky Mobile Bottom CTA Bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[#0b0e20]/95 backdrop-blur-xl border-t border-white/10 p-3 sm:hidden shadow-2xl">
        <div className="max-w-lg mx-auto flex items-center gap-2">
          <a
            href={`https://wa.me/201020304050?text=${encodeURIComponent('مرحباً! أود الاستفسار عن تفاصيل إنشاء موقع Soulove 💖')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-600/30"
            title="تواصل واتساب"
          >
            <MessageCircle size={20} />
          </a>

          <button
            type="button"
            onClick={() => handleOpenOrder()}
            className="flex-1 py-3 rounded-2xl text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
            style={{
              background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
              color: '#ffffff',
              boxShadow: '0 8px 20px -4px rgba(255, 59, 104, 0.5)',
              border: 'none',
            }}
          >
            <Gift size={16} />
            <span>اصنع موقعك الخاص الآن 🚀 ({landingData.pricing?.price || 399} ج.م)</span>
          </button>
        </div>
      </div>

      {/* 📦 Direct Order Modal */}
      <OrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        selectedPackage={selectedPackage}
      />
    </div>
  )
}
