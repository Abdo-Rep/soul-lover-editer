import React, { useState, useEffect } from 'react'
import { Heart, Gift } from 'lucide-react'
import UsHero from './components/UsHero'
import UsFeatureShowcase from './components/UsFeatureShowcase'
import UsPhonePreview from './components/UsPhonePreview'
import UsSteps from './components/UsSteps'
import UsPricing from './components/UsPricing'
import UsReviews from './components/UsReviews'
import UsFAQ from './components/UsFAQ'
import UsFooter from './components/UsFooter'
import UsOrderModal from './components/UsOrderModal'
import UsOrderSuccessPage from './components/UsOrderSuccessPage'
import UsAdminDashboard from './components/UsAdminDashboard'
import {
  getLandingDataUs,
  initMetaPixelUs,
  syncFromSupabaseUs,
} from '../data/landingStoreUs'

export default function UsApp({ initialRoute }) {
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (initialRoute) return initialRoute
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || ''
      const path = window.location.pathname || ''
      if (
        hash.startsWith('#order-success') ||
        hash.startsWith('#thank-you') ||
        path.includes('/order-success') ||
        path.includes('/thank-you')
      ) {
        return 'success'
      }
      if (
        hash === '#admin' ||
        path === '/landing/us/admin' ||
        path === '/us/admin' ||
        path === '/us-admin'
      ) {
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

  const [landingData, setLandingData] = useState(getLandingDataUs())
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(
    landingData.pricing?.packageName || 'The Complete VIP Love Sanctuary 👑'
  )

  // Sync latest data from Supabase on boot
  useEffect(() => {
    syncFromSupabaseUs().then(() => {
      const fresh = getLandingDataUs()
      setLandingData(fresh)
      if (fresh.pixels?.metaPixelId) {
        initMetaPixelUs(fresh.pixels.metaPixelId)
      }
    })
  }, [])

  // Initialize Meta Pixel on startup if configured
  useEffect(() => {
    if (landingData.pixels?.metaPixelId) {
      initMetaPixelUs(landingData.pixels.metaPixelId)
    }
  }, [landingData.pixels?.metaPixelId])

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || ''
      const path = window.location.pathname || ''

      if (
        hash.startsWith('#order-success') ||
        hash.startsWith('#thank-you') ||
        path.includes('/order-success') ||
        path.includes('/thank-you')
      ) {
        const match = hash.match(/id=([^&]+)/)
        if (match) setCurrentOrderId(match[1])
        setCurrentRoute('success')
      } else if (
        hash === '#admin' ||
        path === '/landing/us/admin' ||
        path === '/us/admin' ||
        path === '/us-admin'
      ) {
        setCurrentRoute('admin')
      } else {
        setCurrentRoute('home')
      }

      const freshData = getLandingDataUs()
      setLandingData(freshData)
      if (freshData.pixels?.metaPixelId) {
        initMetaPixelUs(freshData.pixels.metaPixelId)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleOpenOrder = (pkgName) => {
    if (typeof pkgName === 'string') setSelectedPackage(pkgName)
    else setSelectedPackage(landingData.pricing?.packageName || 'The Complete VIP Love Sanctuary 👑')
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

  const exitAdmin = () => {
    window.location.pathname = '/landing/us'
    setCurrentRoute('home')
  }

  const backHomeFromSuccess = () => {
    window.location.hash = ''
    window.location.pathname = '/landing/us'
    setCurrentRoute('home')
  }

  // 1. US Admin Dashboard View
  if (currentRoute === 'admin') {
    return <UsAdminDashboard onExitAdmin={exitAdmin} />
  }

  // 2. US Purchase Success Page
  if (currentRoute === 'success') {
    return (
      <UsOrderSuccessPage
        orderId={currentOrderId}
        onBackHome={backHomeFromSuccess}
        pricing={landingData.pricing}
      />
    )
  }

  // 3. Main US Landing Page View (LTR Layout & Clean US Styling)
  return (
    <div
      className="min-h-screen bg-[#070913] text-slate-100 flex flex-col justify-between selection:bg-[#ff3b68] selection:text-white"
      dir="ltr"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
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
              onClick={() => handleOpenOrder()}
              className="px-4 py-1.5 rounded-xl text-white font-extrabold text-xs flex flex-col items-center justify-center cursor-pointer shadow-md active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                color: '#ffffff',
                boxShadow: '0 4px 12px rgba(255, 59, 104, 0.4)',
                border: 'none',
              }}
            >
              <div className="flex items-center gap-1">
                <Gift size={13} />
                <span>Order Now (${landingData.pricing?.price || '19.99'}) 🚀</span>
              </div>
              <span className="text-[9px] font-bold text-amber-200 leading-none pt-0.5">
                Instant Delivery in 30 Min ⚡
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-lg mx-auto space-y-2">
        <UsHero
          hero={landingData.hero}
          onOpenOrder={handleOpenOrder}
          onScrollToDemo={handleScrollToDemo}
        />
        <UsFeatureShowcase
          featuresSection={landingData.featuresSection}
        />
        <UsPhonePreview
          demo={landingData.demo}
          onOpenOrder={handleOpenOrder}
        />
        <UsSteps
          stepsSection={landingData.stepsSection}
        />
        <UsPricing
          pricing={landingData.pricing}
          onOpenOrder={handleOpenOrder}
        />
        <UsReviews
          reviewsSection={landingData.reviewsSection}
        />
        <UsFAQ
          faqsSection={landingData.faqsSection}
        />
      </main>

      {/* Footer */}
      <UsFooter onOpenOrder={handleOpenOrder} />

      {/* Order Modal */}
      <UsOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        selectedPackage={selectedPackage}
      />
    </div>
  )
}
