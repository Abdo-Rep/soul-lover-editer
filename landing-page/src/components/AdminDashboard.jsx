import {
  Save,
  Package,
  Globe,
  FileText,
  ShoppingBag,
  Trash2,
  CheckCircle,
  ExternalLink,
  MessageCircle,
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
  ChevronLeft,
  Webhook,
  Send,
  Copy,
  Code2,
} from 'lucide-react'
import {
  getLandingData,
  saveLandingData,
  getStoredOrders,
  updateOrderStatus,
  deleteOrder,
  syncFromSupabase,
} from '../data/landingStore'
import { Bell, BellRing, Download, Volume2, Smartphone } from 'lucide-react'

const ADMIN_PASSWORD = 'Mohammedosha1#'
const AUTH_STORAGE_KEY = 'soulove_landing_admin_auth_v1'

// 🔔 Pleasant Web Audio Synthesizer Chime (Zero External Files Required)
function playOrderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    // Note 1 (E6 - 1318Hz)
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

    // Note 2 (G6 - 1567Hz)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(1567.98, ctx.currentTime + 0.12)
    gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(ctx.currentTime + 0.12)
    osc2.stop(ctx.currentTime + 0.7)

    // Note 3 (C7 - 2093Hz) - Celebration bell
    const osc3 = ctx.createOscillator()
    const gain3 = ctx.createGain()
    osc3.type = 'sine'
    osc3.frequency.setValueAtTime(2093.0, ctx.currentTime + 0.25)
    gain3.gain.setValueAtTime(0.35, ctx.currentTime + 0.25)
    gain3.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)
    osc3.connect(gain3)
    gain3.connect(ctx.destination)
    osc3.start(ctx.currentTime + 0.25)
    osc3.stop(ctx.currentTime + 1.2)
  } catch (e) {
    console.log('Audio chime synthesis error:', e)
  }
}

export default function AdminDashboard({ onExitAdmin }) {
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
  const [data, setData] = useState(getLandingData())
  const [orders, setOrders] = useState(getStoredOrders())
  const [saveSuccess, setSaveSuccess] = useState(false)

  // 📲 PWA & Notification States
  const [installPrompt, setInstallPrompt] = useState(null)
  const [isPwaInstalled, setIsPwaInstalled] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted'
    }
    return false
  })
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [newOrderToast, setNewOrderToast] = useState(null)
  const [testWebhookLoading, setTestWebhookLoading] = useState(false)
  const [testWebhookResult, setTestWebhookResult] = useState(null)
  const [copiedApi, setCopiedApi] = useState(false)
  const knownOrderIdsRef = React.useRef(new Set(getStoredOrders().map((o) => o.id)))

  // Sub-forms local states
  const [newPricingFeature, setNewPricingFeature] = useState('')
  const [newFeatureCard, setNewFeatureCard] = useState({ title: '', desc: '', icon: 'Sparkles' })
  const [newStep, setNewStep] = useState({ num: '', title: '', desc: '' })
  const [newReview, setNewReview] = useState({ name: '', rating: 5, date: 'الآن', comment: '' })
  const [newFaq, setNewFaq] = useState({ q: '', a: '' })

  // 1. Listen for PWA Install Prompt
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
    }

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsPwaInstalled(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  }, [])

  // 2. Real-time Background Polling Engine for New Orders & Instant Notifications
  useEffect(() => {
    if (!isAuthenticated) return

    // Initial populate of known order IDs
    const initial = getStoredOrders()
    setOrders(initial)
    knownOrderIdsRef.current = new Set(initial.map((o) => o.id))

    const pollInterval = setInterval(async () => {
      const serverData = await syncFromSupabase()
      if (serverData && Array.isArray(serverData.orders)) {
        const freshOrders = serverData.orders
        setOrders(freshOrders)

        // Check for any new incoming orders
        const brandNewOrders = freshOrders.filter((o) => !knownOrderIdsRef.current.has(o.id))
        if (brandNewOrders.length > 0) {
          const newest = brandNewOrders[0]

          // 1. Play Chime Sound
          if (soundEnabled) {
            playOrderChime()
          }

          // 2. Show Toast Alert
          setNewOrderToast({
            title: `🎉 وصلك طلب جديد الآن!`,
            body: `${newest.yourName || 'عميل'} & ${newest.partnerName || 'الشريك'} (${newest.package || 'باقة الحب'})`,
            phone: newest.phone,
          })
          setTimeout(() => setNewOrderToast(null), 8000)

          // 3. Fire Native Browser / System Push Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification('🎉 وصلك طلب جديد في Soulove!', {
                body: `العميل: ${newest.yourName} & ${newest.partnerName} (${newest.package || 'باقة الحب'}) - ${newest.phone}`,
                icon: '/apple-touch-icon.png',
                vibrate: [200, 100, 200],
              })
            } catch (e) {
              console.log('Notification dispatch note:', e)
            }
          }

          // Update ref
          freshOrders.forEach((o) => knownOrderIdsRef.current.add(o.id))
        }
      }
    }, 10000) // checks every 10 seconds

    return () => clearInterval(pollInterval)
  }, [isAuthenticated, soundEnabled])

  // PWA Install Trigger
  const handleInstallPwa = async () => {
    if (!installPrompt) {
      alert('📱 لتثبيت التطبيق على هاتفك:\n- على أندرويد/كروم: اضغط على القائمة (⋮) ثم "إضافة إلى الشاشة الرئيسية" (Install App).\n- على آيفون/سفاري: اضغط على زر المشاركة (Share) ثم "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).')
      return
    }
    installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setIsPwaInstalled(true)
      setInstallPrompt(null)
    }
  }

  // Request Notification Permission Trigger
  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      alert('متصفحك لا يدعم الإشعارات المباشرة.')
      return
    }
    const permission = await Notification.requestPermission()
    if (permission === 'granted') {
      setNotificationsEnabled(true)
      playOrderChime()
      try {
        new Notification('🔔 تم تفعيل إشعارات الطلبات بنجاح!', {
          body: 'ستصلك إشعارات فورية ورنات تنبيه عند تسجيل أي عميل لطلب جديد.',
          icon: '/apple-touch-icon.png',
        })
      } catch (e) {}
    } else {
      setNotificationsEnabled(false)
    }
  }

  const handleTestWebhook = async () => {
    const url = data.webhook?.url?.trim()
    if (!url) {
      alert('يرجى إدخال رابط الـ Webhook أولاً قبل إجراء التجربة.')
      return
    }
    setTestWebhookLoading(true)
    setTestWebhookResult(null)
    try {
      const testPayload = {
        event: 'test_order_notification',
        orderId: 'TEST_' + Date.now().toString().slice(-4),
        createdAt: new Date().toISOString(),
        status: 'جديد',
        yourName: 'كريم (تجربة)',
        partnerName: 'سارة (تجربة)',
        phone: '01012345678',
        package: 'باقة الحب VIP 👑',
        notes: 'طلب تجريبي لاختبار الأتمتة وإرسال الواتساب',
        whatsappFormattedMessage: `🎉 *وصلك طلب تجريبي جديد في Soulove!* 💖\n\n👤 *اسم الشاب:* كريم (تجربة)\n👰 *اسم البنت:* سارة (تجربة)\n📱 *رقم الواتساب:* 01012345678\n📦 *الباقة:* باقة الحب VIP (260 ج.م)\n⏰ *تاريخ الطلب:* ${new Date().toLocaleString('ar-EG')}`,
      }

      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      })

      setTestWebhookResult({ success: true, message: '✅ تم إرسال البيانات التجريبية بنجاح إلى رابط الـ Webhook!' })
    } catch (err) {
      setTestWebhookResult({ success: false, message: '⚠️ تعذر الإرسال: ' + err.message })
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
    saveLandingData(data)
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 2500)
  }

  // --- Pricing Handlers ---
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

  // --- Features Cards Handlers ---
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

  // --- Steps Handlers ---
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

  // --- Reviews Handlers ---
  const handleAddReview = () => {
    if (!newReview.name.trim() || !newReview.comment.trim()) return
    setData({
      ...data,
      reviewsSection: {
        ...data.reviewsSection,
        items: [...(data.reviewsSection?.items || []), newReview],
      },
    })
    setNewReview({ name: '', rating: 5, date: 'الآن', comment: '' })
  }

  const handleRemoveReview = (idx) => {
    const updated = data.reviewsSection?.items?.filter((_, i) => i !== idx) || []
    setData({ ...data, reviewsSection: { ...data.reviewsSection, items: updated } })
  }

  // --- FAQ Handlers ---
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

  // --- Orders Handlers ---
  const handleStatusChange = async (id, newStatus) => {
    setOrders((prev) => (Array.isArray(prev) ? prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o)) : []))
    try {
      await updateOrderStatus(id, newStatus)
    } catch (err) {
      console.error('Failed to update order status:', err)
    }
  }

  const handleDeleteOrder = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      setOrders((prev) => (Array.isArray(prev) ? prev.filter((o) => o.id !== id) : []))
      try {
        await deleteOrder(id)
      } catch (err) {
        console.error('Failed to delete order:', err)
      }
    }
  }

  // 🔒 Password Protection Screen
  if (!isAuthenticated) {
    return (
      <div
        className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center p-4 selection:bg-[#ff3b68] selection:text-white"
        dir="rtl"
        style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}
      >
        <div className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#0f142d] border border-[#ff3b68]/30 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-[#ff3b68]/30" style={{ background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)' }}>
            <KeyRound size={28} />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-2xl font-black text-white">دخول لوحة تحكم صفحة الهبوط 🔒</h1>
            <p className="text-xs text-slate-300">أدخل كلمة المرور السرية للمتابعة وإدارة الأسعار والإعدادات والطلبات</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 pt-2">
            <div className="text-right">
              <label className="block text-xs font-bold text-slate-300 mb-1.5">كلمة المرور:</label>
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
                  ❌ كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى!
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                color: '#ffffff',
                boxShadow: '0 8px 20px -4px rgba(255, 59, 104, 0.5)',
                border: 'none',
              }}
            >
              <span>تسجيل الدخول للوحة التحكم 🚀</span>
            </button>
          </form>

          <button
            type="button"
            onClick={onExitAdmin}
            className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer block mx-auto pt-2"
          >
            ← العودة لصفحة الهبوط الرئيسية
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 p-3 sm:p-6 relative selection:bg-[#ff3b68] selection:text-white" dir="rtl" style={{ fontFamily: "'Cairo', 'Almarai', system-ui, sans-serif" }}>
      
      {/* 🔔 Floating Real-time Order Alert Toast Banner */}
      {newOrderToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md p-3.5 rounded-2xl bg-emerald-950 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold animate-bounce">
              <BellRing size={18} />
            </div>
            <div>
              <h4 className="text-xs font-black text-emerald-300">{newOrderToast.title}</h4>
              <p className="text-[11px] text-white font-bold">{newOrderToast.body}</p>
              <p className="text-[10px] text-emerald-400 font-mono">{newOrderToast.phone}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setNewOrderToast(null)}
            className="text-xs text-emerald-400 hover:text-white p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* 📱 Sliding Side Drawer / Hamburger Menu Modal (Pinned to RIGHT) */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 animate-in fade-in duration-200" dir="rtl">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer Panel Fixed on the RIGHT */}
          <div
            className="fixed top-0 right-0 bottom-0 w-full max-w-xs sm:max-w-sm h-full bg-[#0b0e20] border-l border-[#ff3b68]/30 shadow-2xl flex flex-col justify-between p-5 overflow-y-auto z-10 animate-in slide-in-from-right-full duration-300"
            dir="rtl"
          >
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#ff3b68] flex items-center justify-center text-white font-bold shadow-md shadow-[#ff3b68]/30">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">إعدادات وقائمة التحكم</h3>
                    <p className="text-[10px] text-slate-400">Soulove Platform</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation Sections List */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                  الأقسام والصفحات
                </span>
                {[
                  { id: 'orders', label: '📦 الطلبات الواردة', badge: orders.length },
                  { id: 'webhook', label: '⚡ ربط الواتساب والـ Webhook (API)', badge: 'جديد' },
                  { id: 'pricing', label: '🏷️ السعر والباقة', badge: null },
                  { id: 'demo', label: '📱 النموذج الحي والباسورد', badge: null },
                  { id: 'pixels', label: '📊 بكسل الفيسبوك والإعلانات', badge: null },
                  { id: 'hero', label: '📝 الهيدر والشارات', badge: null },
                  { id: 'features', label: `✨ المميزات (${data.featuresSection?.items?.length || 0})`, badge: null },
                  { id: 'steps', label: `⚡ خطوات العمل (${data.stepsSection?.items?.length || 0})`, badge: null },
                  { id: 'reviews', label: `⭐ آراء العملاء (${data.reviewsSection?.items?.length || 0})`, badge: null },
                  { id: 'faqs', label: `💡 الأسئلة الشائعة (${data.faqsSection?.items?.length || 0})`, badge: null },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id)
                      setIsMenuOpen(false)
                    }}
                    className={`w-full p-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                      activeTab === item.id
                        ? 'bg-[#ff3b68] text-white shadow-md shadow-[#ff3b68]/30 font-black'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
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

              {/* PWA & Notification Tools in Drawer */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2">
                  أدوات التطبيق والتنبيهات
                </span>

                {/* PWA Install */}
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className="w-full p-2.5 rounded-xl bg-[#12183a] border border-cyan-500/30 text-cyan-200 hover:bg-[#18214f] text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Smartphone size={16} className="text-cyan-400" />
                    <span>{isPwaInstalled ? '✅ التطبيق مثبت' : '📲 تثبيت التطبيق (PWA)'}</span>
                  </div>
                  {!isPwaInstalled && <Download size={13} className="text-cyan-400" />}
                </button>

                {/* Notifications */}
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="w-full p-2.5 rounded-xl bg-[#12183a] border border-amber-500/30 text-amber-200 hover:bg-[#18214f] text-xs font-bold flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <BellRing size={16} className="text-amber-400" />
                    <span>{notificationsEnabled ? '🔔 الإشعارات مفعّلة' : '🔔 تفعيل الإشعارات'}</span>
                  </div>
                </button>

                {/* Sound Chime & Test */}
                <div className="p-2.5 rounded-xl bg-[#12183a] border border-purple-500/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-purple-200 font-bold">
                    <Volume2 size={16} className="text-purple-400" />
                    <span>صوت الرنة</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleTestNotification}
                      className="px-2 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 text-[10px] font-bold cursor-pointer"
                    >
                      🔊 تجربة
                    </button>
                    <button
                      type="button"
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold cursor-pointer ${
                        soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {soundEnabled ? 'مفعّل' : 'مكتوم'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Logout Button */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-rose-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogOut size={16} />
                <span>تسجيل الخروج وقفل اللوحة 🔒</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-4xl mx-auto space-y-4">
        
        {/* 🌟 Compact & Sleek Top Bar (Mobile-First & Clean) */}
        <header className="flex items-center justify-between gap-2 p-3 sm:p-4 rounded-2xl bg-[#0f142d] border border-[#ff3b68]/30 shadow-lg">
          {/* Right: Hamburger Menu Button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMenuOpen(true)}
              className="px-3 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#ff3b68]/30 active:scale-95 transition-transform"
            >
              <Menu size={16} />
              <span>القائمة ☰</span>
              {orders.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-white text-[#ff3b68] leading-none">
                  {orders.length}
                </span>
              )}
            </button>

            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-white leading-none">لوحة التحكم ⚙️</h1>
              <p className="text-[10px] text-slate-400">Soulove Platform</p>
            </div>
          </div>

          {/* Left: Quick Actions (Save & Preview) */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-3.5 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95 transition-transform"
              style={{
                background: 'linear-gradient(135deg, #ff3b68 0%, #ff527b 100%)',
                color: '#ffffff',
                border: 'none',
              }}
            >
              <Save size={14} />
              <span>{saveSuccess ? '✅ تم الحفظ!' : 'حفظ 💾'}</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-[#181f44] hover:bg-[#202a5c] border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              title="معاينة الموقع"
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">معاينة</span>
            </button>
          </div>
        </header>

        {/* Back to Orders Banner if in another Tab */}
        {activeTab !== 'orders' && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#121736] border border-[#ff3b68]/30">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowRight size={14} />
              <span>← العودة لقائمة الطلبات (الرئيسية)</span>
            </button>
            <span className="text-[11px] text-slate-400 font-bold">
              القسم الحالي: {activeTab === 'webhook' ? 'ربط الواتساب والأتمتة' : activeTab}
            </span>
          </div>
        )}

        {/* ⚡ Tab: Webhook & WhatsApp Automation API */}
        {activeTab === 'webhook' && (
          <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <Webhook className="text-[#ff3b68]" size={20} />
                <span>ربط الواتساب والأتمتة الفورية (Webhooks & API) ⚡</span>
              </h2>
            </div>

            {/* Explanation Banner */}
            <div className="p-4 rounded-2xl bg-[#0f1533] border border-cyan-500/30 text-xs space-y-1.5 text-cyan-200">
              <span className="font-black text-white text-sm flex items-center gap-1.5">
                <Send size={15} className="text-cyan-400" />
                <span>كيف يعمل نظام إرسال الطلبات للواتساب؟</span>
              </span>
              <p className="text-slate-300 leading-relaxed">
                بمجرد قيام أي عميل بملء فورم الطلب في صفحة الهبوط، يقوم السيرفر بإرسال طلب <span className="text-amber-300 font-mono">POST Webhook</span> فوري إلى الرابط الخاص بك (سواء كنت تستخدم <strong>n8n</strong> أو <strong>Make.com</strong> أو <strong>بوابة واتساب WhatsApp Gateway</strong>) ليتم إرسال رسالة الواتساب إلى هاتفك أو إلى العميل فوراً وبدون أي تأخير!
              </p>
            </div>

            {/* Webhook URL Input */}
            <div className="p-5 rounded-2xl bg-[#070913] border border-[#1d254a] space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  رابط الـ Webhook الخاص بك (Webhook URL):
                </label>
                <input
                  type="url"
                  placeholder="https://your-n8n-domain.com/webhook/soulove-new-order"
                  value={data.webhook?.url || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      webhook: { ...data.webhook, url: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1024] border border-[#232d56] text-white text-xs font-mono focus:outline-none focus:border-[#ff3b68]"
                  dir="ltr"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  ضع رابط الـ Webhook من n8n أو Make.com وسيتم إرسال كل طلب جديد إليه في أجزاء من الثانية.
                </span>
              </div>

              {/* Test Webhook Trigger Button */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestWebhook}
                  disabled={testWebhookLoading}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-xs flex items-center gap-2 cursor-pointer shadow-md active:scale-95 transition-all disabled:opacity-50"
                >
                  <Send size={15} />
                  <span>{testWebhookLoading ? 'جاري الإرسال التجريبي...' : '🚀 تجربة إرسال Webhook فوري الآن'}</span>
                </button>

                {testWebhookResult && (
                  <span className={`text-xs font-bold ${testWebhookResult.success ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {testWebhookResult.message}
                  </span>
                )}
              </div>
            </div>

            {/* Direct REST API Access */}
            <div className="p-5 rounded-2xl bg-[#070913] border border-[#1d254a] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 size={16} className="text-amber-400" />
                  <span>رابط الـ API المباشر لجلب كافة الطلبات (GET Orders API):</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0c1024] border border-[#1d254a]" dir="ltr">
                <span className="flex-1 font-mono text-[11px] text-amber-300 truncate select-all">
                  {typeof window !== 'undefined' ? `${window.location.origin}/api/landing?action=orders` : '/api/landing?action=orders'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const apiUrl = `${window.location.origin}/api/landing?action=orders`
                    navigator.clipboard?.writeText(apiUrl)
                    setCopiedApi(true)
                    setTimeout(() => setCopiedApi(false), 2500)
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={13} />
                  <span>{copiedApi ? 'تم النسخ ✅' : 'نسخ'}</span>
                </button>
              </div>

              <span className="text-[11px] text-slate-400 block">
                يمكنك استدعاء هذا الرابط في أي وقت من خلال n8n أو كود بايثون أو أي سكريبت لجلب كل الطلبات بصيغة JSON نظيفة ومرتبة.
              </span>
            </div>

            {/* Sample Webhook JSON Payload */}
            <div className="p-5 rounded-2xl bg-[#070913] border border-[#1d254a] space-y-2">
              <span className="text-xs font-bold text-white block">
                شكل البيانات (JSON Payload) التي ستصل إلى الـ Webhook:
              </span>
              <pre
                className="p-3.5 rounded-xl bg-[#04060d] text-emerald-400 font-mono text-[11px] overflow-x-auto leading-relaxed border border-white/5"
                dir="ltr"
              >
{`{
  "event": "new_order",
  "orderId": "1786321456",
  "yourName": "كريم",
  "partnerName": "سارة",
  "phone": "01012345678",
  "package": "باقة الحب VIP",
  "createdAt": "2026-08-10T07:20:00.000Z",
  "whatsappFormattedMessage": "🎉 *وصلك طلب جديد في Soulove!* 💖\\n\\n👤 *اسم الشاب:* كريم\\n👰 *اسم البنت:* سارة\\n📱 *رقم الواتساب:* 01012345678\\n📦 *الباقة:* باقة الحب VIP"
}`}
              </pre>
            </div>
          </div>
        )}

        {/* 1. Tab: Pricing */}
        {activeTab === 'pricing' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Package className="text-[#ff3b68]" size={20} />
              <span>إعدادات الباقة وسعر الموقع 🏷️</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  السعر الحالي (ج.م):
                </label>
                <input
                  type="text"
                  value={data.pricing?.price || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pricing: { ...data.pricing, price: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-bold focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  السعر القديم قبل الخصم (ج.م):
                </label>
                <input
                  type="text"
                  value={data.pricing?.oldPrice || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pricing: { ...data.pricing, oldPrice: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم الباقة:
                </label>
                <input
                  type="text"
                  value={data.pricing?.packageName || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pricing: { ...data.pricing, packageName: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-bold focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  شارة الخصم أو العرض:
                </label>
                <input
                  type="text"
                  value={data.pricing?.badge || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pricing: { ...data.pricing, badge: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:border-[#ff3b68]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الوصف التعريفي للباقة:
                </label>
                <input
                  type="text"
                  value={data.pricing?.subtitle || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pricing: { ...data.pricing, subtitle: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:border-[#ff3b68]"
                />
              </div>
            </div>

            {/* Features List Manager */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <label className="block text-xs font-bold text-slate-300">
                المميزات المكتوبة داخل كارت الباقة:
              </label>

              <div className="space-y-2">
                {data.pricing?.features?.map((feat, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-[#070913] border border-[#19213d]"
                  >
                    <input
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const updated = [...(data.pricing?.features || [])]
                        updated[idx] = e.target.value
                        setData({
                          ...data,
                          pricing: { ...data.pricing, features: updated },
                        })
                      }}
                      className="flex-1 bg-transparent text-white text-xs font-medium focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePricingFeature(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="حذف الميزة"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="أضف ميزة جديدة للباقة..."
                  value={newPricingFeature}
                  onChange={(e) => setNewPricingFeature(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs focus:border-[#ff3b68]"
                />
                <button
                  type="button"
                  onClick={handleAddPricingFeature}
                  className="px-4 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={15} />
                  <span>إضافة ميزة</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Tab: Demo & Password */}
        {activeTab === 'demo' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Globe className="text-[#ff3b68]" size={20} />
              <span>إعدادات رابط وباسورد الموقع التجريبي 📱</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رابط الموقع الذي يظهر داخل شاشة الهاتف في صفحة الهبوط:
                </label>
                <input
                  type="url"
                  value={data.demo?.url || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      demo: { ...data.demo, url: e.target.value },
                    })
                  }
                  placeholder="https://soul-lover-gules.vercel.app/ssss"
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-mono focus:border-[#ff3b68]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    🔑 كلمة السر للتجربة (المكتوبة للزوار):
                  </label>
                  <input
                    type="text"
                    value={data.demo?.password || 'love'}
                    onChange={(e) =>
                      setData({
                        ...data,
                        demo: { ...data.demo, password: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-mono font-bold focus:border-[#ff3b68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    نص إرشاد الباسورد:
                  </label>
                  <input
                    type="text"
                    value={data.demo?.hintText || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        demo: { ...data.demo, hintText: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:border-[#ff3b68]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pixels & Tracking */}
        {activeTab === 'pixels' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <span className="text-xl">📊</span>
              <span>ربط بكسل الفيسبوك والكونفرجن API (Meta CAPI) 🎯</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  1. معرّف بكسل الفيسبوك (Meta Pixel ID):
                </label>
                <input
                  type="text"
                  placeholder="مثال: 123456789012345"
                  value={data.pixels?.metaPixelId || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pixels: { ...data.pixels, metaPixelId: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-mono focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  2. رمز وصول الكونفرجن API (Conversions API Access Token):
                </label>
                <textarea
                  rows={3}
                  placeholder="ألصق هنا رمز الوصول (EAAG... Token) الذي تستخرجه من Meta Events Manager > Settings > Conversions API > Generate Access Token"
                  value={data.pixels?.metaCapiToken || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      pixels: { ...data.pixels, metaCapiToken: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs font-mono focus:border-[#ff3b68]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    3. كود اختبار الأحداث (Test Event Code) - اختياري:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: TEST12345 (من تبويب Test Events)"
                    value={data.pixels?.metaTestEventCode || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        pixels: { ...data.pixels, metaTestEventCode: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-mono focus:border-[#ff3b68]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    معرّف بكسل تيك توك (TikTok Pixel ID) - اختياري:
                  </label>
                  <input
                    type="text"
                    placeholder="مثال: C1234567890"
                    value={data.pixels?.tiktokPixelId || ''}
                    onChange={(e) =>
                      setData({
                        ...data,
                        pixels: { ...data.pixels, tiktokPixelId: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-mono focus:border-[#ff3b68]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-200">
                  <CheckCircle size={16} />
                  <span>قوة وسرعة Meta Conversions API (CAPI):</span>
                </div>
                <p className="leading-relaxed text-[11px] text-slate-300">
                  ⚡ يتم إرسال عمليات الشراء <strong>مباشرة من السيرفر (Server-Side)</strong> عبر Meta Graph API مع تشفير بيانات العميل (SHA-256) ومطابقتها مع المتصفح عبر <code>event_id</code>، مما يضمن وصول 100% من المبيعات لفيسبوك حتى لو كان العميل يستخدم مانع إعلانات (AdBlocker) أو نظام iOS 14.5+!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Tab: Hero & Badges */}
        {activeTab === 'hero' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="text-[#ff3b68]" size={20} />
              <span>نصوص الهيدر والعناوين والشارات 📝</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  الشارة العلوية (Badge):
                </label>
                <input
                  type="text"
                  value={data.hero?.badge || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      hero: { ...data.hero, badge: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  شارة عدد العملاء (Trust Badge):
                </label>
                <input
                  type="text"
                  value={data.hero?.trustBadge || 'أكثر من 1,500+ عميل سعيد 💖'}
                  onChange={(e) =>
                    setData({
                      ...data,
                      hero: { ...data.hero, trustBadge: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-bold focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  العنوان الرئيسي (السطر الأول):
                </label>
                <input
                  type="text"
                  value={data.hero?.titleLine1 || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      hero: { ...data.hero, titleLine1: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-bold focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  العنوان الرئيسي (السطر الملون الثاني):
                </label>
                <input
                  type="text"
                  value={data.hero?.titleLine2 || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      hero: { ...data.hero, titleLine2: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm font-bold focus:border-[#ff3b68]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                النص التوضيحي (الوصف):
              </label>
              <textarea
                rows={3}
                value={data.hero?.subtitle || ''}
                onChange={(e) =>
                  setData({
                    ...data,
                    hero: { ...data.hero, subtitle: e.target.value },
                  })
                }
                className="w-full px-4 py-3 rounded-xl bg-[#070913] border border-[#232d56] text-white text-sm focus:border-[#ff3b68]"
              />
            </div>
          </div>
        )}

        {/* 4. Tab: Features Cards Manager */}
        {activeTab === 'features' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Sparkles className="text-[#ff3b68]" size={20} />
              <span>إدارة كروت المميزات الحصرية ✨</span>
            </h2>

            {/* Section Header Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">شارة القسم:</label>
                <input
                  type="text"
                  value={data.featuresSection?.badge || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      featuresSection: { ...data.featuresSection, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1">عنوان القسم:</label>
                <input
                  type="text"
                  value={data.featuresSection?.title || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      featuresSection: { ...data.featuresSection, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs font-bold"
                />
              </div>
            </div>

            {/* Existing Cards */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-300">الكروت المعروضة:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {data.featuresSection?.items?.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#070913] border border-[#19213d] space-y-2 relative"
                  >
                    <button
                      type="button"
                      onClick={() => handleRemoveFeatureCard(idx)}
                      className="absolute top-3 left-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                      title="حذف الكارت"
                    >
                      <Trash2 size={15} />
                    </button>
                    <input
                      type="text"
                      value={feat.title}
                      onChange={(e) => {
                        const updated = [...(data.featuresSection?.items || [])]
                        updated[idx] = { ...updated[idx], title: e.target.value }
                        setData({
                          ...data,
                          featuresSection: { ...data.featuresSection, items: updated },
                        })
                      }}
                      className="w-11/12 bg-transparent text-white text-xs font-bold focus:outline-none border-b border-transparent focus:border-[#ff3b68]"
                    />
                    <textarea
                      rows={2}
                      value={feat.desc}
                      onChange={(e) => {
                        const updated = [...(data.featuresSection?.items || [])]
                        updated[idx] = { ...updated[idx], desc: e.target.value }
                        setData({
                          ...data,
                          featuresSection: { ...data.featuresSection, items: updated },
                        })
                      }}
                      className="w-full bg-transparent text-slate-300 text-xs focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Feature Card */}
            <div className="p-4 rounded-2xl bg-[#121736] border border-[#ff3b68]/30 space-y-3">
              <span className="text-xs font-bold text-white block">إضافة كارت ميزة جديد:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="عنوان الكارت (مثال: 🎙️ رسائل صوتية خاصة)"
                  value={newFeatureCard.title}
                  onChange={(e) => setNewFeatureCard({ ...newFeatureCard, title: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="وصف الكارت..."
                  value={newFeatureCard.desc}
                  onChange={(e) => setNewFeatureCard({ ...newFeatureCard, desc: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddFeatureCard}
                className="px-4 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={15} />
                <span>إضافة الكارت</span>
              </button>
            </div>
          </div>
        )}

        {/* 5. Tab: Steps Section Manager */}
        {activeTab === 'steps' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Layers className="text-[#ff3b68]" size={20} />
              <span>إدارة خطوات العمل (3 خطوات) ⚡</span>
            </h2>

            {/* Section Header Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">شارة القسم:</label>
                <input
                  type="text"
                  value={data.stepsSection?.badge || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      stepsSection: { ...data.stepsSection, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1">عنوان القسم:</label>
                <input
                  type="text"
                  value={data.stepsSection?.title || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      stepsSection: { ...data.stepsSection, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs font-bold"
                />
              </div>
            </div>

            {/* Existing Steps */}
            <div className="space-y-3">
              {data.stepsSection?.items?.map((step, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#070913] border border-[#19213d] space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveStep(idx)}
                    className="absolute top-3 left-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#ff3b68]">#{step.num || idx + 1}</span>
                    <input
                      type="text"
                      value={step.title}
                      onChange={(e) => {
                        const updated = [...(data.stepsSection?.items || [])]
                        updated[idx] = { ...updated[idx], title: e.target.value }
                        setData({ ...data, stepsSection: { ...data.stepsSection, items: updated } })
                      }}
                      className="flex-1 bg-transparent text-white text-xs font-bold focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={step.desc}
                    onChange={(e) => {
                      const updated = [...(data.stepsSection?.items || [])]
                      updated[idx] = { ...updated[idx], desc: e.target.value }
                      setData({ ...data, stepsSection: { ...data.stepsSection, items: updated } })
                    }}
                    className="w-full bg-transparent text-slate-300 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Add New Step */}
            <div className="p-4 rounded-2xl bg-[#121736] border border-[#ff3b68]/30 space-y-3">
              <span className="text-xs font-bold text-white block">إضافة خطوة جديدة:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="عنوان الخطوة..."
                  value={newStep.title}
                  onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="شرح الخطوة..."
                  value={newStep.desc}
                  onChange={(e) => setNewStep({ ...newStep, desc: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddStep}
                className="px-4 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={15} />
                <span>إضافة خطوة</span>
              </button>
            </div>
          </div>
        )}

        {/* 6. Tab: Reviews Section Manager */}
        {activeTab === 'reviews' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Star className="text-[#ff3b68]" size={20} />
              <span>إدارة آراء وتقييمات العملاء ⭐</span>
            </h2>

            {/* Section Header Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">شارة القسم:</label>
                <input
                  type="text"
                  value={data.reviewsSection?.badge || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      reviewsSection: { ...data.reviewsSection, badge: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-400 mb-1">عنوان القسم:</label>
                <input
                  type="text"
                  value={data.reviewsSection?.title || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      reviewsSection: { ...data.reviewsSection, title: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs font-bold"
                />
              </div>
            </div>

            {/* Existing Reviews */}
            <div className="space-y-3">
              {data.reviewsSection?.items?.map((rev, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#070913] border border-[#19213d] space-y-2 relative"
                >
                  <button
                    type="button"
                    onClick={() => handleRemoveReview(idx)}
                    className="absolute top-3 left-3 text-slate-500 hover:text-rose-400 cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      value={rev.name}
                      onChange={(e) => {
                        const updated = [...(data.reviewsSection?.items || [])]
                        updated[idx] = { ...updated[idx], name: e.target.value }
                        setData({ ...data, reviewsSection: { ...data.reviewsSection, items: updated } })
                      }}
                      className="bg-transparent text-white text-xs font-bold focus:outline-none"
                    />
                    <input
                      type="text"
                      value={rev.date}
                      onChange={(e) => {
                        const updated = [...(data.reviewsSection?.items || [])]
                        updated[idx] = { ...updated[idx], date: e.target.value }
                        setData({ ...data, reviewsSection: { ...data.reviewsSection, items: updated } })
                      }}
                      className="bg-transparent text-slate-500 text-[10px] focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={rev.comment}
                    onChange={(e) => {
                      const updated = [...(data.reviewsSection?.items || [])]
                      updated[idx] = { ...updated[idx], comment: e.target.value }
                      setData({ ...data, reviewsSection: { ...data.reviewsSection, items: updated } })
                    }}
                    className="w-full bg-transparent text-slate-300 text-xs focus:outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Add New Review */}
            <div className="p-4 rounded-2xl bg-[#121736] border border-[#ff3b68]/30 space-y-3">
              <span className="text-xs font-bold text-white block">إضافة رأي عميل جديد:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="اسم العميل (مثال: رنا & يوسف)"
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="الوقت (مثال: منذ 4 أيام)"
                  value={newReview.date}
                  onChange={(e) => setNewReview({ ...newReview, date: e.target.value })}
                  className="px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
                />
              </div>
              <textarea
                rows={2}
                placeholder="نص التقييم والتجربة..."
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs"
              />
              <button
                type="button"
                onClick={handleAddReview}
                className="px-4 py-2 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus size={15} />
                <span>إضافة التقييم</span>
              </button>
            </div>
          </div>
        )}

        {/* 7. Tab: FAQs Section Manager */}
        {activeTab === 'faqs' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="text-[#ff3b68]" size={20} />
                <span>إدارة وتعديل الأسئلة الشائعة 💡 ({data.faqsSection?.items?.length || 0})</span>
              </h2>
            </div>

            {/* Section Header Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#070913] border border-[#19213d]">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">شارة القسم (Badge):</label>
                <input
                  type="text"
                  value={data.faqsSection?.badge || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      faqsSection: { ...data.faqsSection, badge: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1024] border border-[#232d56] text-white text-xs font-bold focus:outline-none focus:border-[#ff3b68]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">عنوان قسم الأسئلة الرئيسي:</label>
                <input
                  type="text"
                  value={data.faqsSection?.title || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      faqsSection: { ...data.faqsSection, title: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1024] border border-[#232d56] text-white text-xs font-bold focus:outline-none focus:border-[#ff3b68]"
                />
              </div>
            </div>

            {/* Existing FAQs List */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-300 block">الأسئلة الحالية القابلة للتعديل:</span>
              {data.faqsSection?.items?.map((faq, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#070913] border border-[#19213d] space-y-3 relative hover:border-[#ff3b68]/40 transition-colors"
                >
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <span className="px-3 py-0.5 rounded-full bg-[#ff3b68]/20 text-[#ff8fa3] text-xs font-black">
                      سؤال #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 cursor-pointer transition-colors"
                      title="حذف هذا السؤال"
                    >
                      <Trash2 size={14} />
                      <span>حذف</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">السؤال:</label>
                      <input
                        type="text"
                        value={faq.q}
                        onChange={(e) => {
                          const updated = [...(data.faqsSection?.items || [])]
                          updated[idx] = { ...updated[idx], q: e.target.value }
                          setData({ ...data, faqsSection: { ...data.faqsSection, items: updated } })
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1024] border border-[#232d56] text-white text-xs font-bold focus:outline-none focus:border-[#ff3b68]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">الإجابة والتوضيح:</label>
                      <textarea
                        rows={3}
                        value={faq.a}
                        onChange={(e) => {
                          const updated = [...(data.faqsSection?.items || [])]
                          updated[idx] = { ...updated[idx], a: e.target.value }
                          setData({ ...data, faqsSection: { ...data.faqsSection, items: updated } })
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#0c1024] border border-[#232d56] text-slate-200 text-xs focus:outline-none focus:border-[#ff3b68] leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New FAQ Box */}
            <div className="p-5 rounded-2xl bg-[#121736] border border-[#ff3b68]/40 space-y-3.5 shadow-lg">
              <span className="text-xs font-extrabold text-white block flex items-center gap-1.5">
                <Plus size={16} className="text-[#ff3b68]" />
                <span>إضافة سؤال وجواب جديد:</span>
              </span>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">نص السؤال الجديد:</label>
                <input
                  type="text"
                  placeholder="مثال: هل يمكن تشغيل الأغاني تلقائياً عند فتح الرابط؟"
                  value={newFaq.q}
                  onChange={(e) => setNewFaq({ ...newFaq, q: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs focus:outline-none focus:border-[#ff3b68]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">نص الإجابة:</label>
                <textarea
                  rows={2}
                  placeholder="اكتب الإجابة المفصلة هنا..."
                  value={newFaq.a}
                  onChange={(e) => setNewFaq({ ...newFaq, a: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070913] border border-[#232d56] text-white text-xs focus:outline-none focus:border-[#ff3b68]"
                />
              </div>

              <button
                type="button"
                onClick={handleAddFaq}
                className="px-5 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#ff3b68]/30 transition-all hover:scale-105"
              >
                <Plus size={16} />
                <span>إضافة السؤال الآن ➕</span>
              </button>
            </div>
          </div>
        )}

        {/* 8. Tab: Orders Manager */}
        {activeTab === 'orders' && (() => {
          const ordersList = Array.isArray(orders) ? orders : []
          return (
            <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-4 sm:space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <ShoppingBag className="text-[#ff3b68]" size={18} />
                    <span>إدارة الطلبات الواردة 📦 ({ordersList.length})</span>
                  </h2>
                  <span className="text-[11px] sm:text-xs text-emerald-400 font-bold flex items-center gap-1.5 pt-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>مزامنة سحابية فورية كل 10 ثوانٍ مع صوت ورنة للطلب</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                  >
                    <BellRing size={13} className="text-purple-300" />
                    <span>🔔 تجربة رنة الطلب</span>
                  </button>
                </div>
              </div>

              {ordersList.length === 0 ? (
                <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#070913] border border-[#19213d] space-y-2">
                  <ShoppingBag size={36} className="text-slate-600 mx-auto" />
                  <p className="text-slate-300 text-sm font-bold">لا يوجد طلبات جديدة حتى الآن.</p>
                  <p className="text-slate-500 text-xs">بمجرد تسجيل أي عميل لطلب جديد في صفحة الهبوط ستظهر بياناته هنا فوراً مع صوت تنبيه وإشعار فوري.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersList.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0c1026] border border-[#1d254a] hover:border-[#ff3b68]/40 space-y-3 transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-sm sm:text-base font-black text-white">
                          {order.yourName} & {order.partnerName} 💖
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ff3b68]/20 text-[#ff8fa3]">
                          #{order.id.slice(-5)}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status || 'جديد'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
                            order.status === 'تم التسليم'
                              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400'
                              : order.status === 'قيد التجهيز'
                              ? 'bg-amber-950/90 border-amber-500/50 text-amber-400'
                              : 'bg-rose-950/90 border-rose-500/50 text-rose-400'
                          }`}
                        >
                          <option value="جديد">🔴 جديد</option>
                          <option value="قيد التجهيز">🟡 قيد التجهيز</option>
                          <option value="تم التسليم">🟢 تم التسليم</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer transition-colors"
                          title="حذف الطلب"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 text-[11px] block">رقم الهاتف:</span>
                        <a
                          href={`tel:${order.phone}`}
                          className="font-bold text-cyan-300 font-mono text-xs hover:underline"
                        >
                          {order.phone}
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">الباقة:</span>
                        <span className="font-bold text-slate-200">{order.package || 'باقة الحب'}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 text-[11px] block">تاريخ الطلب:</span>
                        <span className="text-slate-400">{new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-2.5 rounded-xl bg-white/5 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 block mb-0.5 text-[11px]">ملاحظات العميل:</span>
                        <span>{order.notes}</span>
                      </div>
                    )}

                    {/* Direct WhatsApp Contact Button */}
                    <div className="pt-1">
                      <a
                        href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, '')}?text=مرحباً ${encodeURIComponent(order.yourName)} 💖 بخصوص طلبك لإنشاء موقع Soulove الخاص بكما`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                      >
                        <MessageCircle size={15} />
                        <span>مراسلة العميل عبر الواتساب 💬</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })()}

      </div>
    </div>
  )
}
