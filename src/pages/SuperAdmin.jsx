import { useCallback, useEffect, useState } from 'react'
import { Check, Copy, ExternalLink, Key, Mail, Plus, ShieldCheck, Trash2, Globe, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react'

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
  const [newSlug, setNewSlug] = useState('')
  const [newSitePass, setNewSitePass] = useState('soulove')
  const [newAdminPass, setNewAdminPass] = useState('soulove')
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
        throw new Error('فشل جلب قائمة المواقع')
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

    // Verify against DB super_admins table via API
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
      setNewSitePass('soulove')
      setNewAdminPass('soulove')
      fetchSites(token, email)
    } catch (err) {
      setCreateError(err.message)
    } finally {
      setIsCreating(false)
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

  // Render Login Screen if not authenticated
  if (!token) {
    return (
      <div className="min-h-screen bg-[#110a18] text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1a0f28]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 mb-4 border border-rose-500/30">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold text-white">تسجيل الدخول</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-500"
                  required
                />
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-500"
                  required
                />
                <Key className="absolute left-3 top-3.5 w-4 h-4 text-white/40" />
              </div>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
                {authError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {isLoggingIn ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'دخول 🚀'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <div className="min-h-screen bg-[#0e0714] text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-[#160c22] border border-white/10 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">لوحة التحكم</h1>
              <p className="text-xs text-rose-200/60 mt-0.5">
                البريد: <span className="text-emerald-400 font-semibold">{email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSites(token, email)}
              className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-medium shadow-lg shadow-rose-500/20 flex items-center gap-2 transition-all text-sm"
            >
              <Plus className="w-5 h-5" />
              إنشاء موقع عميل جديد
            </button>

            <button
              onClick={() => {
                localStorage.removeItem('super_admin_token')
                setToken('')
              }}
              className="px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-sm transition-colors"
            >
              خروج
            </button>
          </div>
        </div>

        {/* Sites List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90">
              مواقع العملاء الحالية ({sites.length})
            </h2>
          </div>

          {fetchError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm">
              {fetchError}
            </div>
          )}

          {sites.length === 0 && !isLoading ? (
            <div className="p-12 text-center rounded-3xl bg-[#160c22]/50 border border-white/5 space-y-4">
              <Globe className="w-12 h-12 text-white/20 mx-auto" />
              <p className="text-white/60 text-sm">لا يوجد مواقع عملاء أنشئت بعد.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-sm font-medium transition-colors"
              >
                إضافة أول عميل بضغطة زر 🚀
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sites.map((site) => {
                const visitorUrl = `${baseUrl}/${site.slug}`
                const dashboardUrl = `${baseUrl}/${site.slug}/dashboard`

                return (
                  <div
                    key={site.slug}
                    className="p-5 rounded-2xl bg-[#160c22] border border-white/10 hover:border-rose-500/40 transition-all space-y-4 shadow-lg group"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs text-rose-400 font-mono font-medium">/{site.slug}</span>
                        <h3 className="text-lg font-bold text-white capitalize">{site.slug}</h3>
                      </div>
                      <button
                        onClick={() => setDeleteTargetSlug(site.slug)}
                        className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 opacity-80 group-hover:opacity-100 transition-opacity"
                        title="حذف الموقع"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-black/40 text-xs text-white/70 font-mono">
                      <div>
                        <span className="text-white/40 block">كلمة سر الزائر:</span>
                        <span className="text-rose-300 font-semibold">{site.site_password}</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">كلمة سر الداشبورد:</span>
                        <span className="text-amber-300 font-semibold">{site.admin_password || 'soulove'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <a
                        href={visitorUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                        رابط الزائر
                      </a>

                      <button
                        onClick={() => copyToClipboard(visitorUrl, `${site.slug}-vis`)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-colors"
                        title="نسخ رابط الزائر"
                      >
                        {copiedKey === `${site.slug}-vis` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <a
                        href={dashboardUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Key className="w-3.5 h-3.5 text-rose-400" />
                        داشبورد العميل
                      </a>

                      <button
                        onClick={() => copyToClipboard(dashboardUrl, `${site.slug}-dash`)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
                        title="نسخ رابط الداشبورد"
                      >
                        {copiedKey === `${site.slug}-dash` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-[#160c22] border border-white/15 p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-rose-400" />
                إضافة موقع عميل جديد بضغطة زر
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white/40 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                  معرّف موقع العميل (Slug)
                </label>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '-'))}
                  placeholder="مثال: ahmed-and-sara"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-rose-500"
                  required
                />
                <span className="text-[11px] text-white/40 mt-1 block">
                  الرابط سيكون: {baseUrl}/{newSlug || 'nameclient'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                  كلمة مرور زائر الصفحة (Site Password)
                </label>
                <input
                  type="text"
                  value={newSitePass}
                  onChange={(e) => setNewSitePass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-200/80 mb-1.5">
                  كلمة مرور داشبورد العميل (Admin Password)
                </label>
                <input
                  type="text"
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  {createError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-sm font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'توليد الموقع الآن 🚀'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Branded Delete Confirmation Modal */}
      {deleteTargetSlug && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-3xl bg-[#180d26] border border-rose-500/30 p-6 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-white">تأكيد حذف موقع العميل</h4>
              <p className="text-xs text-rose-200/70">
                هل أنت تأكد من حذف موقع العميل (<span className="text-rose-300 font-mono font-bold">/{deleteTargetSlug}</span>) بالكامل من داتابيز Contabo؟
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetSlug(null)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteSite}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-2"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'نعم، احذف الموقع'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
