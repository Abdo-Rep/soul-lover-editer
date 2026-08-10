import React, { useState, useEffect } from 'react'
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
} from 'lucide-react'
import {
  getLandingData,
  saveLandingData,
  getStoredOrders,
  updateOrderStatus,
  deleteOrder,
} from '../data/landingStore'

export default function AdminDashboard({ onExitAdmin }) {
  const [activeTab, setActiveTab] = useState('pricing')
  const [data, setData] = useState(getLandingData())
  const [orders, setOrders] = useState(getStoredOrders())
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Sub-forms local states
  const [newPricingFeature, setNewPricingFeature] = useState('')
  const [newFeatureCard, setNewFeatureCard] = useState({ title: '', desc: '', icon: 'Sparkles' })
  const [newStep, setNewStep] = useState({ num: '', title: '', desc: '' })
  const [newReview, setNewReview] = useState({ name: '', rating: 5, date: 'الآن', comment: '' })
  const [newFaq, setNewFaq] = useState({ q: '', a: '' })

  useEffect(() => {
    setOrders(getStoredOrders())
  }, [])

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
  const handleStatusChange = (id, newStatus) => {
    const updated = updateOrderStatus(id, newStatus)
    if (updated) setOrders(updated)
  }

  const handleDeleteOrder = (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      const updated = deleteOrder(id)
      if (updated) setOrders(updated)
    }
  }

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 p-4 sm:p-8" dir="rtl">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#0f142d] border border-[#ff3b68]/30 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#ff3b68] to-[#ff758c] flex items-center justify-center text-white font-bold shadow-md shadow-[#ff3b68]/30">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">لوحة تحكم وتخصيص صفحة الهبوط ⚙️</h1>
              <p className="text-xs text-slate-300">تحكم كامل في جميع الكروت، العناوين، الأسعار، الباسورد، والطلبات</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSaveAll}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl btn-romantic-primary text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-105 transition-transform"
            >
              <Save size={16} />
              <span>{saveSuccess ? '✅ تم الحفظ بنجاح!' : 'حفظ التعديلات 💾'}</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="px-4 py-2.5 rounded-xl bg-[#181f44] hover:bg-[#202a5c] border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>معاينة الموقع</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0b0e20] border border-[#19213d]">
          {[
            { id: 'pricing', label: '🏷️ السعر والباقة' },
            { id: 'demo', label: '📱 النموذج الحي والباسورد' },
            { id: 'pixels', label: '📊 بكسل الفيسبوك وتتبع الإعلانات' },
            { id: 'hero', label: '📝 الهيدر والشارات' },
            { id: 'features', label: `✨ المميزات (${data.featuresSection?.items?.length || 0})` },
            { id: 'steps', label: `⚡ خطوات العمل (${data.stepsSection?.items?.length || 0})` },
            { id: 'reviews', label: `⭐ آراء العملاء (${data.reviewsSection?.items?.length || 0})` },
            { id: 'faqs', label: `💡 الأسئلة (${data.faqsSection?.items?.length || 0})` },
            { id: 'orders', label: `📦 الطلبات (${orders.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#ff3b68] text-white shadow-md shadow-[#ff3b68]/30'
                  : 'text-slate-300 hover:text-white hover:bg-[#141a38]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

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
        {activeTab === 'orders' && (
          <div className="p-6 rounded-3xl bg-[#0b0e20] border border-[#19213d] space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingBag className="text-[#ff3b68]" size={20} />
                <span>إدارة الطلبات الواردة من الفورم 📦 ({orders.length})</span>
              </h2>
            </div>

            {orders.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-[#070913] border border-[#19213d] space-y-2">
                <ShoppingBag size={40} className="text-slate-600 mx-auto" />
                <p className="text-slate-400 text-sm font-bold">لا يوجد طلبات واردة حتى الآن.</p>
                <p className="text-slate-500 text-xs">أي عميل يملأ النموذج في صفحة الهبوط ستظهر بياناته هنا فوراً.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl bg-[#070913] border border-[#19213d] space-y-3 transition-all hover:border-[#ff3b68]/30"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-black text-white">
                          {order.yourName} & {order.partnerName} 💖
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff3b68]/20 text-[#ff8fa3]">
                          #{order.id.slice(-6)}
                        </span>
                      </div>

                      {/* Status Selector */}
                      <div className="flex items-center gap-2">
                        <select
                          value={order.status || 'جديد'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer focus:outline-none ${
                            order.status === 'تم التسليم'
                              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-400'
                              : order.status === 'قيد التجهيز'
                              ? 'bg-amber-950/80 border-amber-500/50 text-amber-400'
                              : 'bg-rose-950/80 border-rose-500/50 text-rose-400'
                          }`}
                        >
                          <option value="جديد">🔴 جديد</option>
                          <option value="قيد التجهيز">🟡 قيد التجهيز</option>
                          <option value="تم التسليم">🟢 تم التسليم</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                          title="حذف الطلب"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
                      <div>
                        <span className="text-slate-500 block">رقم الهاتف:</span>
                        <a
                          href={`tel:${order.phone}`}
                          className="font-bold text-white font-mono hover:underline"
                        >
                          {order.phone}
                        </a>
                      </div>

                      <div>
                        <span className="text-slate-500 block">الباقة:</span>
                        <span className="font-bold text-slate-200">{order.package}</span>
                      </div>

                      <div>
                        <span className="text-slate-500 block">تاريخ الطلب:</span>
                        <span className="text-slate-400">{new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="p-2.5 rounded-xl bg-white/5 text-xs text-slate-300">
                        <span className="font-bold text-slate-400 block mb-0.5">ملاحظات العميل:</span>
                        <span>{order.notes}</span>
                      </div>
                    )}

                    {/* Direct WhatsApp Contact Button */}
                    <div className="pt-2 flex gap-2">
                      <a
                        href={`https://wa.me/${order.phone?.replace(/[^0-9]/g, '')}?text=مرحباً ${encodeURIComponent(order.yourName)} 💖 بخصوص طلبك لإنشاء موقع Soulove الخاص بكما`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                      >
                        <MessageCircle size={14} />
                        <span>مراسلة العميل عبر الواتساب</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
