import { useCallback, useEffect, useRef, useState } from 'react'

// ─── PWA Install Button ───────────────────────────────────────────────────────
function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [installed, setInstalled] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const tipRef = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setInstalled(true)
      return
    }
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e) }
    const onInstalled = () => { setInstalled(true); setDeferredPrompt(null) }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  useEffect(() => {
    if (!showTip) return
    const handler = (e) => { if (tipRef.current && !tipRef.current.contains(e.target)) setShowTip(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showTip])

  if (installed) return null

  const handleClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') setInstalled(true)
      setDeferredPrompt(null)
    } else {
      setShowTip((v) => !v)
    }
  }

  return (
    <div className="relative" ref={tipRef}>
      <button
        type="button"
        onClick={handleClick}
        title="تثبيت كتطبيق 📲"
        className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-[#0f152d] border border-[#1e294d] text-[#7786a5] hover:text-white hover:border-[#ff3b68] transition-all text-xs font-bold"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
          <line x1="12" y1="18" x2="12" y2="18" strokeWidth="3" />
        </svg>
        <span className="hidden sm:inline">تثبيت التطبيق</span>
      </button>

      {showTip && (
        <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl border border-[#19213d] bg-[#0b0e20] p-4 shadow-2xl text-right z-50">
          <p className="text-xs font-bold text-white mb-2">📲 كيف تثبت التطبيق؟</p>
          <div className="space-y-1.5 text-[11px] text-[#7786a5]">
            <p>🤖 <span className="text-white font-semibold">أندرويد Chrome:</span> اضغط ⋮ ← «تثبيت التطبيق»</p>
            <p>🍎 <span className="text-white font-semibold">iPhone Safari:</span> اضغط <span className="font-bold">⎋</span> ← «إضافة إلى الشاشة الرئيسية»</p>
            <p>💻 <span className="text-white font-semibold">كمبيوتر Chrome:</span> اضغط <span className="font-bold">⊕</span> في شريط العنوان</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Custom Inline SVG Icons
const HeartSvg = ({ className = "w-6 h-6 text-[#ff3b68]" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)

const PlusSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const LogoutSvg = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

const GlobeSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
)

const KeySvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-1.5 1.5l-3 3m-2.5 2.5l-5.5 5.5A2.83 2.83 0 0 1 4 17.5V20h2.5c.8 0 1.5-.3 2.1-.9l5.5-5.5m2.5-2.5l3-3m1.5-1.5L22 2z" />
    <circle cx="7.5" cy="16.5" r="1.5" />
  </svg>
)

const TrashSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
)

const CopySvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const CheckSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const RefreshSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 4v6h-6" />
    <path d="M1 20v-6h6" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
)

const MailSvg = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
)

const AlertSvg = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
)

export default function SuperAdmin() {
  const [email, setEmail] = useState(() => localStorage.getItem('super_admin_email') || '')
  const [token, setToken] = useState(() => localStorage.getItem('super_admin_token') || '')
  const [inputPassword, setInputPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const [sites, setSites] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [fetchError, setFetchError] = useState('')

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showSouloveModal, setShowSouloveModal] = useState(false)
  const [newSlug, setNewSlug] = useState('')
  const [newSitePass, setNewSitePass] = useState('love')
  const [newAdminPass, setNewAdminPass] = useState('love')
  const [newLanguage, setNewLanguage] = useState('ar')
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  // Delete Confirm Modal State
  const [deleteTargetSlug, setDeleteTargetSlug] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Copy Feedback Toast
  const [copiedKey, setCopiedKey] = useState('')

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  const fetchSites = useCallback(async (authToken, adminEmail) => {
    setIsLoading(true)
    setFetchError('')
    try {
      const res = await fetch(`/api/super-admin`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'X-Admin-Email': adminEmail,
        },
      })
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem('super_admin_token')
          setToken('')
          setAuthError('بيانات الدخول غير صحيحة أو غير مسجلة بقاعدة البيانات')
          return
        }
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.error || 'فشل جلب قائمة المواقع')
      }
      const data = await res.json()
      setSites(data.sites || [])
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchSites(token, email)
    }
  }, [token, email, fetchSites])

  const handleLogin = (e) => {
    e.preventDefault()
    if (!inputPassword.trim() || !email.trim()) {
      setAuthError('يرجى إدخال البريد الإلكتروني وكلمة المرور المسجلة بالداتابيز')
      return
    }
    setIsLoggingIn(true)
    setAuthError('')

    fetch(`/api/super-admin`, {
      headers: {
        Authorization: `Bearer ${inputPassword}`,
        'X-Admin-Email': email,
      },
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem('super_admin_email', email)
          localStorage.setItem('super_admin_token', inputPassword)
          setToken(inputPassword)
          setInputPassword('')
        } else {
          setAuthError('بيانات الدخول غير مسجلة بقاعدة البيانات')
        }
      })
      .catch(() => setAuthError('تعذّر الاتصال بالخادم'))
      .finally(() => setIsLoggingIn(false))
  }

  const handleCreateSite = async (e) => {
    e.preventDefault()
    if (!newSlug.trim()) {
      setCreateError('يرجى تحديد اسم موقع العميل')
      return
    }

    setIsCreating(true)
    setCreateError('')

    try {
      const res = await fetch('/api/super-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Email': email,
        },
        body: JSON.stringify({
          slug: newSlug,
          sitePassword: newSitePass || 'soulove',
          adminPassword: newAdminPass || 'soulove',
          language: newLanguage,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.error === 'slug_already_exists') {
          throw new Error('هذا الاسم مستخدم بالفعل، يرجى اختيار اسم آخر')
        }
        throw new Error(data.error || 'فشل إنشاء الموقع')
      }

      setShowCreateModal(false)
      setNewSlug('')
      setNewSitePass('love')
      setNewAdminPass('love')
      setNewLanguage('ar')
      fetchSites(token, email)
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setIsCreating(false)
    }
  }

  const handleToggleActive = async (slug, newStatus) => {
    try {
      const res = await fetch(`/api/super-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Email': email,
        },
        body: JSON.stringify({ slug, isActive: newStatus }),
      })
      if (res.ok) {
        fetchSites(token, email)
      } else {
        setFetchError('فشل تعديل حالة الموقع')
      }
    } catch (err) {
      setFetchError(err.message)
    }
  }

  const handleLanguageChange = async (slug, newLang) => {
    try {
      const res = await fetch(`/api/super-admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Admin-Email': email,
        },
        body: JSON.stringify({ slug, language: newLang }),
      })
      if (res.ok) {
        fetchSites(token, email)
      } else {
        setFetchError('فشل تعديل لغة الموقع')
      }
    } catch (err) {
      setFetchError(err.message)
    }
  }

  const confirmDeleteSite = async () => {
    if (!deleteTargetSlug) return
    setIsDeleting(true)

    try {
      const res = await fetch(`/api/super-admin?slug=${encodeURIComponent(deleteTargetSlug)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Admin-Email': email,
        },
      })
      if (res.ok) {
        setDeleteTargetSlug(null)
        fetchSites(token, email)
      } else {
        setFetchError('فشل حذف الموقع من الخادم')
      }
    } catch (err) {
      setFetchError('خطأ أثناء الحذف: ' + err.message)
    } finally {
      setIsDeleting(false)
    }
  }

  // Login Screen if not logged in
  if (!token) {
    return (
      <div className="min-h-screen bg-[#060713] text-white flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="w-full max-w-md bg-[#0b0e20] border border-[#19213d] rounded-3xl p-8 shadow-2xl text-right">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#261128] text-[#ff3b68] mb-4 border border-[#4a1835]">
              <HeartSvg className="w-8 h-8 text-[#ff3b68]" />
            </div>
            <h1 className="text-xl font-bold text-white">السوبر أدمن (SaaS)</h1>
            <p className="text-xs text-[#7786a5] mt-1">تسجيل الدخول لإدارة لوحة النظام</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#7786a5] mb-1.5 text-right">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@saalove.com"
                  className="w-full px-4 py-3 rounded-xl bg-[#060814] border border-[#19213d] text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff3b68]"
                  required
                />
                <MailSvg className="absolute left-3 top-3.5 w-4 h-4 text-[#7786a5]" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#7786a5] mb-1.5 text-right">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="كلمة مرور الأدمن"
                  className="w-full px-4 py-3 rounded-xl bg-[#060814] border border-[#19213d] text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff3b68]"
                  required
                />
                <KeySvg className="absolute left-3 top-3.5 w-4 h-4 text-[#7786a5]" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-[#281125] border border-[#4a1835] text-[#ff3b68] text-xs text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white font-bold shadow-lg shadow-[#ff3b68]/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isLoggingIn ? <RefreshSvg className="w-5 h-5 animate-spin" /> : 'دخول 🚀'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const souloveSite = sites.find((s) => s.slug === 'soulove')

  return (
    <div className="min-h-screen bg-[#060713] text-white p-3 sm:p-6 font-sans" dir="rtl">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
        
        {/* Top Header matching reference image: Title on Right, Buttons on Left */}
        <div className="flex flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-[#0b0e20] border border-[#19213d]">
          {/* Right Side (RTL): Heart icon (NO BACKGROUND) + Title */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-right">
            <HeartSvg className="w-6 h-6 sm:w-7 sm:h-7 text-[#ff3b68] shrink-0" />
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-wide">
                السوبر أدمن (SaaS)
              </h1>
            </div>
          </div>

          {/* Left Side (RTL): Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Clickable Master Site Card */}
            <button
              type="button"
              onClick={() => setShowSouloveModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#281125] border border-[#ff3b68]/40 hover:border-[#ff3b68] text-xs font-bold text-white transition-all hover:bg-[#341430] cursor-pointer"
              title="عرض تفاصيل الموقع الرئيسي"
            >
              <span>الموقع الرئيسي</span>
              <span className="p-1 rounded-lg bg-[#ff3b68] text-white text-[10px] shadow-sm shadow-[#ff3b68]/30 flex items-center justify-center shrink-0">
                👑
              </span>
            </button>

            <PWAInstallButton />

            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="p-2 sm:p-2.5 rounded-xl bg-[#0f152d] border border-[#1e294d] text-white/70 hover:text-white transition-colors"
              title="تسجيل الخروج"
              aria-label="تسجيل الخروج"
            >
              <LogoutSvg className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>


        {/* Main Sites Container */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#080b1a] border border-[#19213d] p-3.5 sm:p-5 space-y-3.5 sm:space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#19213d]/60">
            <span className="text-sm font-bold text-white/90">
              ({sites.length})
            </span>
            <button
              type="button"
              onClick={() => fetchSites(token, email)}
              className="text-xs font-semibold text-[#ff3b68] hover:underline flex items-center gap-1 transition-colors"
            >
              <RefreshSvg className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              تحديث القائمة
            </button>
          </div>

          {fetchError && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#281125] border border-[#4a1835] text-[#ff3b68] text-xs">
              {fetchError}
            </div>
          )}

          {sites.length === 0 && !isLoading ? (
            <div className="p-8 sm:p-10 text-center rounded-2xl bg-[#0b0e20] border border-[#19213d] space-y-3">
              <GlobeSvg className="w-10 h-10 text-[#7786a5]/30 mx-auto" />
              <p className="text-[#7786a5] text-xs">لا يوجد مواقع عملاء أنشئت بعد.</p>
              <button
                type="button"
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2 rounded-xl bg-[#281125] border border-[#4a1835] text-[#ff3b68] text-xs font-bold transition-colors"
              >
                إضافة أول عميل بضغطة زر 🚀
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-[#19213d] bg-[#0b0e20]">
                <table className="w-full min-w-[540px] text-right border-collapse" dir="rtl">
                  <thead>
                    <tr className="border-b border-[#19213d] bg-[#0f142d] text-[11px] sm:text-xs text-[#7786a5] font-semibold">
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">الرابط (Slug)</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">كلمة مرور الزائر</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">كلمة مرور الداشبورد</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">اللغة</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">الحالة</th>
                      <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">الروابط والإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#19213d]/60 text-xs">
                    {sites.map((site) => {
                      const visitorUrl = `${baseUrl}/${site.slug}`
                      const dashboardUrl = `${baseUrl}/${site.slug}/login`

                      return (
                        <tr key={site.slug} className="hover:bg-[#0f152e]/50 transition-colors">
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono font-bold text-[#ff3b68] text-right">/{site.slug}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-white/90 text-right">{site.site_password}</td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-mono text-white/90 text-right">{site.admin_password || 'love'}</td>
                           <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                            <select
                              value={site.language || 'ar'}
                              onChange={(e) => handleLanguageChange(site.slug, e.target.value)}
                              className="px-2 py-1 rounded bg-[#060814] border border-[#19213d] text-white/90 text-xs focus:outline-none cursor-pointer"
                            >
                              <option value="ar">العربية 🇪🇬</option>
                              <option value="en">English (US) 🇺🇸</option>
                              <option value="es">Español 🇪🇸</option>
                              <option value="en-GB">English (UK) 🇬🇧</option>
                            </select>
                          </td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(site.slug, !site.is_active)}
                              className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-white transition-all shadow-sm ${
                                site.is_active !== false 
                                  ? 'bg-[#10b981] hover:bg-[#0d9668] shadow-emerald-900/10' 
                                  : 'bg-[#6b7280] hover:bg-[#5a616e] shadow-slate-900/10'
                              }`}
                            >
                              {site.is_active !== false ? 'نشط' : 'غير نشط'}
                            </button>
                          </td>
                          <td className="py-2.5 sm:py-3 px-3 sm:px-4">
                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                              <a
                                href={visitorUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="py-1.5 px-2.5 sm:px-3 rounded-lg bg-[#281125] border border-[#4a1835] text-[#ff3b68] text-[11px] sm:text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                              >
                                <GlobeSvg className="w-3.5 h-3.5" />
                                الزائر
                              </a>
                              <a
                                href={dashboardUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="py-1.5 px-2.5 sm:px-3 rounded-lg bg-[#121c38] border border-[#203058] text-white text-[11px] sm:text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
                              >
                                <KeySvg className="w-3.5 h-3.5 text-[#ff3b68]" />
                                login
                              </a>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(visitorUrl, `${site.slug}-copy`)}
                                className="p-1.5 sm:p-2 rounded-lg bg-[#0f152d] border border-[#1e294d] text-white/70 hover:text-white transition-colors shrink-0"
                                title="نسخ رابط الزائر"
                              >
                                {copiedKey === `${site.slug}-copy` ? <CheckSvg className="w-3.5 h-3.5 text-emerald-400" /> : <CopySvg className="w-3.5 h-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTargetSlug(site.slug)}
                                className="p-1.5 sm:p-2 rounded-lg bg-[#0f152d] border border-[#1e294d] text-[#7786a5] hover:text-[#ff3b68] transition-colors shrink-0"
                                title="حذف الموقع"
                              >
                                <TrashSvg className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
          )}
        </div>

      </div>

      {/* Floating Action Button (FAB) - Circular Plus Button on Bottom Right */}
      <button
        type="button"
        onClick={() => setShowCreateModal(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#ff3b68] to-[#ff5b85] hover:from-[#e62e5c] hover:to-[#e64e74] text-white shadow-2xl shadow-[#ff3b68]/50 border border-white/25 transition-all hover:scale-110 active:scale-90 cursor-pointer backdrop-blur-md"
        aria-label="إضافة موقع جديد"
        title="إضافة موقع جديد"
      >
        <PlusSvg className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 cursor-pointer"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false)
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-[#0b0e20] border border-[#19213d] p-6 shadow-2xl space-y-5 text-right cursor-default">
            <div className="flex items-center justify-between pb-3 border-b border-[#19213d]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PlusSvg className="w-5 h-5 text-[#ff3b68]" />
                إضافة موقع عميل جديد
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-[#7786a5] hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#7786a5] mb-1.5 text-right">
                  معرّف موقع العميل (Slug)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                  placeholder="مثال: ahmed-and-sara"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060814] border border-[#19213d] text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#ff3b68]"
                  required
                />
                <span className="text-[11px] text-[#7786a5] mt-1 block text-right">
                  الرابط سيكون: {baseUrl}/{newSlug || 'nameclient'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7786a5] mb-1.5 text-right">
                  كلمة مرور زائر الصفحة (Site Password)
                </label>
                <input
                  type="text"
                  value={newSitePass}
                  onChange={(e) => setNewSitePass(e.target.value.replace(/[\u0600-\u06FF\s]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060814] border border-[#19213d] text-white text-sm focus:outline-none focus:border-[#ff3b68]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7786a5] mb-1.5 text-right">
                  كلمة مرور داشبورد العميل (Admin Password)
                </label>
                <input
                  type="text"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value.replace(/[\u0600-\u06FF\s]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060814] border border-[#19213d] text-white text-sm focus:outline-none focus:border-[#ff3b68]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7786a5] mb-1.5 text-right">
                  لغة الموقع الافتراضية (Default Language)
                </label>
                <select
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#060814] border border-[#19213d] text-white text-sm focus:outline-none focus:border-[#ff3b68] cursor-pointer"
                >
                  <option value="ar">العربية 🇪🇬</option>
                  <option value="en">English (US) 🇺🇸</option>
                  <option value="es">Español 🇪🇸</option>
                  <option value="en-GB">English (UK) 🇬🇧</option>
                </select>
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-[#281125] border border-[#4a1835] text-[#ff3b68] text-xs text-right">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0f152d] border border-[#1e294d] text-white/70 text-xs font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <RefreshSvg className="w-4 h-4 animate-spin" /> : 'توليد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetSlug && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4 cursor-pointer"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTargetSlug(null)
          }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#0b0e20] border border-[#19213d] p-6 shadow-2xl text-center space-y-4 cursor-default">
            <div className="w-14 h-14 rounded-2xl bg-[#281125] text-[#ff3b68] border border-[#4a1835] flex items-center justify-center mx-auto">
              <AlertSvg className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">تأكيد حذف موقع العميل</h4>
              <p className="text-xs text-[#7786a5]">
                هل أنت تأكد من حذف موقع العميل (<span className="text-[#ff3b68] font-mono font-bold">/{deleteTargetSlug}</span>) بالكامل؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetSlug(null)}
                className="px-5 py-2.5 rounded-xl bg-[#0f152d] border border-[#1e294d] text-white/70 text-xs transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={confirmDeleteSite}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                {isDeleting ? <RefreshSvg className="w-4 h-4 animate-spin" /> : 'نعم، احذف الموقع'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLogoutModal(false)
          }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#0b0e20] border border-[#19213d] p-6 shadow-2xl text-center space-y-4 cursor-default">
            <div className="w-14 h-14 rounded-2xl bg-[#281125] text-[#ff3b68] border border-[#4a1835] flex items-center justify-center mx-auto">
              <LogoutSvg className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">تأكيد تسجيل الخروج</h4>
              <p className="text-xs text-[#7786a5]">
                هل أنت تأكد من رغبتك في تسجيل الخروج من لوحة التحكم؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#0f152d] border border-[#1e294d] text-white/70 text-xs font-medium transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false)
                  localStorage.removeItem('super_admin_token')
                  setToken('')
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#ff3b68] hover:bg-[#e62e5c] text-white text-xs font-bold transition-colors flex items-center justify-center gap-2"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soulove Master Site Modal Popup */}
      {showSouloveModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          dir="rtl"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowSouloveModal(false)
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-[#0b0e20] border border-[#ff3b68]/40 p-6 shadow-2xl space-y-5 text-right cursor-default">
            <div className="flex items-center justify-between pb-3 border-b border-[#19213d]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">👑</span>
                <div>
                  <h3 className="text-base font-bold text-white">الموقع الرئيسي: soulove</h3>
                  <p className="text-[11px] text-[#7786a5]">تفاصيل الحساب وروابط الوصول</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSouloveModal(false)}
                className="text-[#7786a5] hover:text-white text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Direct Action Grid (2 buttons: Visitor & Dashboard Login) */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`${baseUrl}/soulove`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-[#281125] border border-[#4a1835] text-[#ff3b68] hover:border-[#ff3b68] transition-all text-center space-y-1.5 group"
              >
                <GlobeSvg className="w-5 h-5 mx-auto text-[#ff3b68] group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">الزائر</div>
                <div className="text-[10px] opacity-70 font-mono">/soulove</div>
              </a>

              <a
                href={`${baseUrl}/soulove/login`}
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-2xl bg-[#121c38] border border-[#203058] text-white hover:border-[#ff3b68] transition-all text-center space-y-1.5 group"
              >
                <KeySvg className="w-5 h-5 mx-auto text-[#ff3b68] group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold">login الداشبورد</div>
                <div className="text-[10px] opacity-70 font-mono">/soulove/login</div>
              </a>
            </div>

            {/* Detailed Password Cards */}
            <div className="rounded-2xl border border-[#19213d] bg-[#060814] p-4 space-y-3">
              <h4 className="text-xs font-bold text-white/80 border-b border-[#19213d] pb-2">📋 كلمات المرور المسجلة:</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#0b0e20] p-2.5 rounded-xl border border-[#19213d] flex items-center justify-between">
                  <div>
                    <span className="text-[#7786a5] block text-[10px]">كلمة مرور الزائر:</span>
                    <span className="font-mono text-white font-bold">{souloveSite?.site_password || '1234'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(souloveSite?.site_password || '1234', 'soulove-vis-pass')}
                    className="p-1 rounded bg-[#0f152d] text-white/70 hover:text-white"
                  >
                    {copiedKey === 'soulove-vis-pass' ? <CheckSvg className="w-3 h-3 text-emerald-400" /> : <CopySvg className="w-3 h-3" />}
                  </button>
                </div>
                <div className="bg-[#0b0e20] p-2.5 rounded-xl border border-[#19213d] flex items-center justify-between">
                  <div>
                    <span className="text-[#7786a5] block text-[10px]">كلمة مرور الداشبورد:</span>
                    <span className="font-mono text-white font-bold">{souloveSite?.admin_password || 'love'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(souloveSite?.admin_password || 'love', 'soulove-adm-pass')}
                    className="p-1 rounded bg-[#0f152d] text-white/70 hover:text-white"
                  >
                    {copiedKey === 'soulove-adm-pass' ? <CheckSvg className="w-3 h-3 text-emerald-400" /> : <CopySvg className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowSouloveModal(false)}
                className="px-5 py-2 rounded-xl bg-[#0f152d] border border-[#1e294d] text-white/80 text-xs font-bold hover:text-white transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
