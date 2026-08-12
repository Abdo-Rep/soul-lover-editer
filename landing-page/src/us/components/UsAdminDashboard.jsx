import React, { useState, useEffect, useRef } from 'react'
import {
  Save,
  Package,
  Globe,
  FileText,
  ShoppingBag,
  Trash2,
  CheckCircle,
  ExternalLink,
  Plus,
  ShieldCheck,
  Sparkles,
  KeyRound,
  Layers,
  HelpCircle,
  Star,
  Menu,
  X,
  LogOut,
  ArrowRight,
  Webhook,
  Send,
  Code2,
  Bell,
  BellRing,
  Volume2,
  Mail,
  Phone,
} from 'lucide-react'
import {
  getLandingDataUs,
  saveLandingDataUs,
  getStoredOrdersUs,
  updateOrderStatusUs,
  deleteOrderUs,
  syncFromSupabaseUs,
} from '../../data/landingStoreUs'

const ADMIN_PASSWORD = 'Mohammedosha1#'
const AUTH_STORAGE_KEY = 'soulove_us_landing_admin_auth_v1'

function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') ctx.resume()

    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(1318.5, ctx.currentTime)
    gain1.gain.setValueAtTime(0.25, ctx.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(ctx.currentTime)
    osc1.stop(ctx.currentTime + 0.5)

    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1760.0, ctx.currentTime + 0.15)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.15)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.15)
    osc2.stop(ctx.currentTime + 0.8)
  } catch (e) {
    console.log('Audio chime error:', e)
  }
}

export default function UsAdminDashboard({ onExitAdmin }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    }
    return false
  })
  const [passwordInput, setPasswordInput] = useState('')
  const [authError, setAuthError] = useState(false)

  const [activeTab, setActiveTab] = useState('orders')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [data, setData] = useState(getLandingDataUs())
  const [orders, setOrders] = useState(getStoredOrdersUs())
  const [saveSuccess, setSaveSuccess] = useState(false)

  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderToast, setNewOrderToast] = useState(null)
  const [testWebhookLoading, setTestWebhookLoading] = useState(false)
  const [testWebhookResult, setTestWebhookResult] = useState(null)
  const knownOrderIdsRef = useRef(new Set(getStoredOrdersUs().map((o) => o.id)))

  // Sub-forms states
  const [newPricingFeature, setNewPricingFeature] = useState('')
  const [newFeatureCard, setNewFeatureCard] = useState({ title: '', desc: '', icon: 'Sparkles' })
  const [newStep, setNewStep] = useState({ num: '', title: '', desc: '' })
  const [newReview, setNewReview] = useState({ name: '', location: 'New York, NY', rating: 5, date: 'Just now', comment: '' })
  const [newFaq, setNewFaq] = useState({ q: '', a: '' })

  // Real-time Polling for US Orders
  useEffect(() => {
    if (!isAuthenticated) return

    const initial = getStoredOrdersUs()
    setOrders(initial)
    knownOrderIdsRef.current = new Set(initial.map((o) => o.id))

    const pollInterval = setInterval(async () => {
      const serverData = await syncFromSupabaseUs()
      if (serverData && Array.isArray(serverData.orders)) {
        const freshOrders = serverData.orders.filter((o) => o.market === 'us')
        setOrders(freshOrders)

        const brandNewOrders = freshOrders.filter((o) => !knownOrderIdsRef.current.has(o.id))
        if (brandNewOrders.length > 0) {
          const newest = brandNewOrders[0]

          if (soundEnabled) playOrderChime()

          setNewOrderToast({
            title: `🎉 New US Order Received!`,
            body: `${newest.yourName || 'Customer'} & ${newest.partnerName || 'Partner'} ($${data.pricing?.price || '19.99'})`,
            email: newest.email,
          })
          setTimeout(() => setNewOrderToast(null), 8000)

          freshOrders.forEach((o) => knownOrderIdsRef.current.add(o.id))
        }
      }
    }, 10000)

    return () => clearInterval(pollInterval)
  }, [isAuthenticated, soundEnabled, data.pricing?.price])

  const handleTestNotification = () => {
    playOrderChime()
    setNewOrderToast({
      title: '🎉 Test US Order Notification!',
      body: 'Michael & Sarah ($19.99 USD)',
      email: 'michael.test@example.com',
    })
    setTimeout(() => setNewOrderToast(null), 6000)
  }

  const handleTestWebhook = async () => {
    const url = data.webhook?.url?.trim()
    if (!url) {
      alert('Please enter a Webhook URL first.')
      return
    }
    setTestWebhookLoading(true)
    setTestWebhookResult(null)
    try {
      const testPayload = {
        event: 'test_order_notification',
        orderId: 'TEST_US_' + Date.now().toString().slice(-4),
        createdAt: new Date().toISOString(),
        status: 'New',
        market: 'us',
        currency: 'USD',
        yourName: 'Michael (Test)',
        partnerName: 'Sarah (Test)',
        email: 'michael@example.com',
        phone: '+1 555-0199',
        package: 'VIP Love Sanctuary ($19.99)',
        notes: 'Test order from US Admin Dashboard',
      }

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      })

      setTestWebhookResult({ success: true, message: '✅ Test Webhook Sent Successfully!' })
    } catch (err) {
      setTestWebhookResult({ success: false, message: '⚠️ Error: ' + err.message })
    } finally {
      setTestWebhookLoading(false)
    }
  }

  const handleLogin = (e) => {
    e.preventDefault()
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      setAuthError(false)
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
      }
    } else {
      setAuthError(true)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
  }

  const handleSaveAll = () => {
    saveLandingDataUs(data)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  // Pricing
  const handleAddPricingFeature = () => {
    if (!newPricingFeature.trim()) return
    setData({
      ...data,
      pricing: {
        ...data.pricing,
        features: [...(data.pricing?.features || []), newPricingFeature.trim()],
      },
    })
    setNewPricingFeature('')
  }

  const handleRemovePricingFeature = (idx) => {
    const updated = data.pricing?.features?.filter((_, i) => i !== idx) || []
    setData({ ...data, pricing: { ...data.pricing, features: updated } })
  }

  // Features
  const handleAddFeatureCard = () => {
    if (!newFeatureCard.title.trim()) return
    setData({
      ...data,
      featuresSection: {
        ...data.featuresSection,
        items: [...(data.featuresSection?.items || []), newFeatureCard],
      },
    })
    setNewFeatureCard({ title: '', desc: '', icon: 'Sparkles' })
  }

  const handleRemoveFeatureCard = (idx) => {
    const updated = data.featuresSection?.items?.filter((_, i) => i !== idx) || []
    setData({
      ...data,
      featuresSection: { ...data.featuresSection, items: updated },
    })
  }

  // Steps
  const handleAddStep = () => {
    if (!newStep.title.trim()) return
    setData({
      ...data,
      stepsSection: {
        ...data.stepsSection,
        items: [
          ...(data.stepsSection?.items || []),
          {
            ...newStep,
            num: newStep.num || `0${(data.stepsSection?.items?.length || 0) + 1}`,
          },
        ],
      },
    })
    setNewStep({ num: '', title: '', desc: '' })
  }

  const handleRemoveStep = (idx) => {
    const updated = data.stepsSection?.items?.filter((_, i) => i !== idx) || []
    setData({ ...data, stepsSection: { ...data.stepsSection, items: updated } })
  }

  // Reviews
  const handleAddReview = () => {
    if (!newReview.name.trim() || !newReview.comment.trim()) return
    setData({
      ...data,
      reviewsSection: {
        ...data.reviewsSection,
        items: [...(data.reviewsSection?.items || []), newReview],
      },
    })
    setNewReview({ name: '', location: 'New York, NY', rating: 5, date: 'Just now', comment: '' })
  }

  const handleRemoveReview = (idx) => {
    const updated = data.reviewsSection?.items?.filter((_, i) => i !== idx) || []
    setData({ ...data, reviewsSection: { ...data.reviewsSection, items: updated } })
  }

  // FAQ
  const handleAddFaq = () => {
    if (!newFaq.q.trim() || !newFaq.a.trim()) return
    setData({
      ...data,
      faqsSection: {
        ...data.faqsSection,
        items: [...(data.faqsSection?.items || []), newFaq],
      },
    })
    setNewFaq({ q: '', a: '' })
  }

  const handleRemoveFaq = (idx) => {
    const updated = data.faqsSection?.items?.filter((_, i) => i !== idx) || []
    setData({ ...data, faqsSection: { ...data.faqsSection, items: updated } })
  }

  // Orders
  const handleStatusChange = async (id, newStatus) => {
    setOrders((prev) => (Array.isArray(prev) ? prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)) : []))
    try {
      await updateOrderStatusUs(id, newStatus)
    } catch (err) {
      console.error('Failed to update US order status:', err)
    }
  }

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      setOrders((prev) => (Array.isArray(prev) ? prev.filter((o) => o.id !== id) : []))
      try {
        await deleteOrderUs(id)
      } catch (err) {
        console.error('Failed to delete US order:', err)
      }
    }
  }

  // 🔒 Password Protection Screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center p-4 selection:bg-[#ff3b68] selection:text-white"
        dir="ltr"
        style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
      >
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0f142d] border border-[#ff3b68]/30 shadow-2xl space-y-6 text-center">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-[#ff3b68]/30"
            style={{ background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)' }}
          >
            <KeyRound size={28} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">
              US Landing Admin 🇺🇸 🔒
            </h1>
            <p className="text-xs text-slate-300">
              Enter admin password to manage US prices, copy, and customer orders.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="text-left">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Password:</label>
              <input
                type="password"
                required
                autoFocus
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value)
                  if (authError) setAuthError(false)
                }}
                className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:outline-none focus:border-[#ff3b68] font-mono text-center tracking-widest"
              />
              {authError && (
                <p className="text-xs text-rose-400 font-bold mt-1.5 text-center">
                  ❌ Incorrect password, please try again!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                border: 'none',
              }}
            >
              <span>Login to US Dashboard 🚀</span>
            </button>
          </form>

          <button
            type="button"
            onClick={onExitAdmin}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer block mx-auto pt-2"
          >
            ← Back to US Landing Page
          </button>
        </div>
      </div>
    )
  }

  const ordersList = Array.isArray(orders) ? orders : []

  return (
    <div
      className="min-h-screen bg-[#070913] text-slate-100 p-3 sm:p-6 relative selection:bg-[#ff3b68] selection:text-white"
      dir="ltr"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif" }}
    >
      {/* 🔔 Toast */}
      {newOrderToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3.5 rounded-2xl bg-emerald-950 border-2 border-emerald-500 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <BellRing size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-300">{newOrderToast.title}</h4>
              <p className="text-[11px] text-white font-bold">{newOrderToast.body}</p>
              <p className="text-[10px] text-emerald-400 font-mono">{newOrderToast.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewOrderToast(null)}
            className="text-xs text-emerald-400 hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200">
          <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-full max-w-xs h-full bg-[#0b0e20] border-r border-[#ff3b68]/30 shadow-2xl flex flex-col justify-between p-5 overflow-y-auto z-10">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#ff3b68] flex items-center justify-center text-white font-bold">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">US Admin Panel 🇺🇸</h3>
                    <p className="text-[10px] text-slate-400">Soulove US Edition</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 text-slate-300 flex items-center justify-center"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { id: 'orders', label: '📦 Customer Orders', badge: ordersList.length },
                  { id: 'pricing', label: '🏷️ Pricing & Features ($)', badge: null },
                  { id: 'pixels', label: '📊 Meta Pixel & CAPI', badge: null },
                  { id: 'webhook', label: '⚡ Webhook & Automation', badge: null },
                  { id: 'hero', label: '📝 Hero & Headings', badge: null },
                  { id: 'features', label: `✨ 6 Features (${data.featuresSection?.items?.length || 0})`, badge: null },
                  { id: 'steps', label: `⚡ 3 Steps (${data.stepsSection?.items?.length || 0})`, badge: null },
                  { id: 'reviews', label: `⭐ Reviews (${data.reviewsSection?.items?.length || 0})`, badge: null },
                  { id: 'faqs', label: `💡 FAQs (${data.faqsSection?.items?.length || 0})`, badge: null },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                      activeTab === item.id
                        ? 'bg-[#ff3b68] text-white font-black'
                        : 'text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#ff3b68]">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Switch to Egyptian Admin */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <a
                  href="/landing/admin"
                  className="w-full p-2.5 rounded-xl bg-[#18214f] text-amber-300 hover:text-white text-xs font-bold flex items-center justify-between"
                >
                  <span>🇪🇬 Switch to Egyptian Admin</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Logout 🔒</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-[#0f142d] border border-[#ff3b68]/30 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#ff3b68] text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Menu size={16} />
              <span>Menu ☰</span>
              {ordersList.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-[#ff3b68]">
                  {ordersList.length}
                </span>
              )}
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-white">US Admin Panel 🇺🇸</h1>
              <p className="text-[10px] text-slate-400">Manage US Landing & Orders</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
              style={{ background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)' }}
            >
              <Save size={14} />
              <span>{saveSuccess ? 'Saved!' : 'Save 💾'}</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#181f44] border border-white/10 text-slate-300 text-xs font-bold flex items-center gap-1"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>
        </header>

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <ShoppingBag className="text-[#ff3b68]" size={18} />
                  <span>Incoming US Orders 📦 ({ordersList.length})</span>
                </h2>
                <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Real-time cloud sync every 10s with audio alerts</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleTestNotification}
                className="px-3 py-1.5 rounded-xl bg-purple-600/30 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5"
              >
                <BellRing size={13} />
                <span>Test Alert</span>
              </button>
            </div>

            {ordersList.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[#070913] border border-[#19213d] space-y-2">
                <ShoppingBag size={36} className="text-slate-600 mx-auto" />
                <p className="text-slate-300 text-sm font-bold">No US orders yet.</p>
                <p className="text-slate-500 text-xs">New orders placed on /landing/us will appear here instantly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersList.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-[#070913] border border-white/10 space-y-3 text-left"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[11px] font-bold font-mono">
                          {order.id}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          {new Date(order.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300">
                        {order.status || 'New'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Customer & Partner:</span>
                        <span className="font-bold text-white text-sm">
                          {order.yourName} 💖 {order.partnerName}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Email Address:</span>
                        <a href={`mailto:${order.email}`} className="font-bold text-cyan-300 hover:underline">
                          {order.email || 'N/A'}
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[10px]">Phone / WhatsApp:</span>
                        <span className="font-bold text-slate-200">
                          {order.phone || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-2.5 rounded-xl bg-white/5 text-xs text-slate-300">
                        <span className="text-slate-400 block text-[10px]">Song / Note:</span>
                        <span>{order.notes}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-white/5 pt-2">
                      <div className="flex items-center gap-1.5">
                        {['New', 'Processing', 'Delivered'].map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(order.id, st)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                              order.status === st
                                ? 'bg-[#ff3b68] text-white'
                                : 'bg-white/5 text-slate-400 hover:text-white'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab: Pricing */}
        {activeTab === 'pricing' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4 text-left">
            <h2 className="text-base sm:text-lg font-black text-white">US Pricing & Package ($)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Price ($ USD):</label>
                <input
                  type="text"
                  value={data.pricing?.price || '19.99'}
                  onChange={(e) => setData({ ...data, pricing: { ...data.pricing, price: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Original Price ($ USD):</label>
                <input
                  type="text"
                  value={data.pricing?.oldPrice || '49.99'}
                  onChange={(e) => setData({ ...data, pricing: { ...data.pricing, oldPrice: e.target.value } })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Package Name:</label>
              <input
                type="text"
                value={data.pricing?.packageName || ''}
                onChange={(e) => setData({ ...data, pricing: { ...data.pricing, packageName: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
              />
            </div>

            {/* Features list */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-slate-300">Package Features:</label>
              <div className="space-y-1.5">
                {(data.pricing?.features || []).map((feat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-[#070913] border border-white/10 text-xs">
                    <span>{feat}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePricingFeature(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add new feature..."
                  value={newPricingFeature}
                  onChange={(e) => setNewPricingFeature(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddPricingFeature}
                  className="px-4 py-2 rounded-xl bg-[#ff3b68] text-white text-xs font-bold"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pixels */}
        {activeTab === 'pixels' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4 text-left">
            <h2 className="text-base sm:text-lg font-black text-white">Meta Pixel & Conversions API (US Market)</h2>
            <p className="text-xs text-slate-300">
              You can paste your Meta Pixel ID here to track US ad purchases with currency: USD ($).
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Meta Pixel ID:</label>
              <input
                type="text"
                placeholder="e.g. 123456789012345"
                value={data.pixels?.metaPixelId || ''}
                onChange={(e) => setData({ ...data, pixels: { ...data.pixels, metaPixelId: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Meta Conversions API (CAPI) Access Token:</label>
              <textarea
                rows={3}
                placeholder="EAAB..."
                value={data.pixels?.metaCapiToken || ''}
                onChange={(e) => setData({ ...data, pixels: { ...data.pixels, metaCapiToken: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs font-mono"
              />
            </div>
          </div>
        )}

        {/* Tab: Webhook */}
        {activeTab === 'webhook' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4 text-left">
            <h2 className="text-base sm:text-lg font-black text-white">Webhook & WhatsApp Automation (US)</h2>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Webhook URL (n8n / Make):</label>
              <input
                type="url"
                placeholder="https://your-n8n.com/webhook/soulove-us-order"
                value={data.webhook?.url || ''}
                onChange={(e) => setData({ ...data, webhook: { ...data.webhook, url: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs font-mono"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={testWebhookLoading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold flex items-center gap-2"
              >
                <Send size={14} />
                <span>{testWebhookLoading ? 'Sending...' : 'Test US Webhook'}</span>
              </button>
              {testWebhookResult && (
                <span className={`text-xs font-bold ${testWebhookResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {testWebhookResult.message}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tab: Hero */}
        {activeTab === 'hero' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4 text-left">
            <h2 className="text-base sm:text-lg font-black text-white">Hero Section</h2>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Badge Text:</label>
              <input
                type="text"
                value={data.hero?.badge || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, badge: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Heading Line 1:</label>
              <input
                type="text"
                value={data.hero?.titleLine1 || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, titleLine1: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Heading Line 2 (Highlighted):</label>
              <input
                type="text"
                value={data.hero?.titleLine2 || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, titleLine2: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Subtitle:</label>
              <textarea
                rows={3}
                value={data.hero?.subtitle || ''}
                onChange={(e) => setData({ ...data, hero: { ...data.hero, subtitle: e.target.value } })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-white/15 text-white text-xs"
              />
            </div>
          </div>
        )}

        {/* Tab: Reviews */}
        {activeTab === 'reviews' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4 text-left">
            <h2 className="text-base sm:text-lg font-black text-white">US Reviews</h2>
            <div className="space-y-2">
              {(data.reviewsSection?.items || []).map((rev, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#070913] border border-white/10 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white">{rev.name}</span>
                    <span className="text-slate-400 text-[10px] block">{rev.location} • {rev.date}</span>
                    <p className="text-slate-300 mt-1 italic">"{rev.comment}"</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(idx)}
                    className="text-rose-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Review */}
            <div className="p-3 rounded-xl bg-[#070913] border border-white/10 space-y-2 text-xs">
              <span className="font-bold text-white block">Add New Review:</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Couple Names (e.g. Sarah & Michael)"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#0c1024] border border-white/15 text-white"
                />
                <input
                  type="text"
                  placeholder="Location (e.g. Los Angeles, CA)"
                  value={newReview.location}
                  onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#0c1024] border border-white/15 text-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Review comment..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0c1024] border border-white/15 text-white"
              />
              <button
                type="button"
                onClick={handleAddReview}
                className="px-4 py-2 rounded-xl bg-[#ff3b68] text-white font-bold"
              >
                Add Review
              </button>
            </div>
          </div>
        )}

        {/* Tab: FAQs */}
        {activeTab === 'faqs' && (
          <div className="p-4 sm:p-6 rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-4 text-left">
            <h2 className="text-base sm:text-lg font-black text-white">US FAQs</h2>
            <div className="space-y-2">
              {(data.faqsSection?.items || []).map((faq, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#070913] border border-white/10 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-white block">Q: {faq.q}</span>
                    <span className="text-slate-300 mt-1 block">A: {faq.a}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFaq(idx)}
                    className="text-rose-400 p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add FAQ */}
            <div className="p-3 rounded-xl bg-[#070913] border border-white/10 space-y-2 text-xs">
              <span className="font-bold text-white block">Add New FAQ:</span>
              <input
                type="text"
                placeholder="Question..."
                value={newFaq.q}
                onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0c1024] border border-white/15 text-white"
              />
              <textarea
                rows={2}
                placeholder="Answer..."
                value={newFaq.a}
                onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0c1024] border border-white/15 text-white"
              />
              <button
                type="button"
                onClick={handleAddFaq}
                className="px-4 py-2 rounded-xl bg-[#ff3b68] text-white font-bold"
              >
                Add FAQ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
