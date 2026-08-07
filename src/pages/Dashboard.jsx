import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  ExternalLink,
  Heart,
  Image,
  KeyRound,
  LogOut,
  Music2,
  Plus,
  Undo,
  Redo,
  Save,
  Sparkles,
  Trash2,
  QrCode,
  Mic,
  Clock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ContentLoadingHearts from '../components/ContentLoadingHearts'
import FeedbackModal from '../components/FeedbackModal'
import QRCodeModal from '../components/dashboard/QRCodeModal'
import VoiceRecorder from '../components/dashboard/VoiceRecorder'
import PWAInstallBanner from '../components/dashboard/PWAInstallBanner'
import NotFound from './NotFound'
import MemoryEditor from '../components/dashboard/MemoryEditor'
import {
  DateInput,
  Field,
  PasswordInput,
  Section,
  TextArea,
  TextInput,
} from '../components/dashboard/DashboardFields'
import { useContent } from '../context/ContentContext'
import { useAdminAuth, grantVisitorPreviewAccess } from '../hooks/useAuth'

const TABS = [
  { id: 'general', label: 'عام', icon: KeyRound },
  { id: 'music', label: 'الموسيقى', icon: Music2 },
  { id: 'login', label: 'صفحة الدخول', icon: Heart },
  { id: 'welcome', label: 'الترحيب', icon: Sparkles },
  { id: 'story', label: 'القصة', icon: Calendar },
  { id: 'memories', label: 'ذكريات القصة', icon: Calendar },
  { id: 'gallery', label: 'المعرض', icon: Image },
  { id: 'wishlist', label: 'قائمة الأمنيات', icon: Sparkles },
  { id: 'countdowns', label: 'العدادات التنازلية', icon: Clock },
  { id: 'final', label: 'الصفحة الأخيرة', icon: Heart },
]

function AdminLoginForm({ onLogin }) {
  const { content, isLoading, verifyAdminPassword, getClientSlug, t } = useContent()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isLoading || submitting) return

    setSubmitting(true)
    setError('')

    try {
      const isValid = await verifyAdminPassword(password)
      if (!isValid) {
        setError(t.adminLoginErrorInvalid || 'كلمة المرور غير صحيحة')
        return
      }

      await onLogin(password)
    } catch {
      setError(t.adminLoginErrorFailed || 'تعذّر التحقق — حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <ContentLoadingHearts />
  }

  const slug = getClientSlug()
  const visitorPath = slug ? `/${slug}` : '/'

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <main className="flex min-h-dvh items-center justify-center px-5 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md rounded-3xl border border-rose-100 bg-white/90 p-8 shadow-xl"
        >
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50">
              <KeyRound className="text-rose-400" size={22} />
            </div>
            <h1 className="font-display text-2xl font-bold text-rose-900">
              {content?.siteName || t.adminLoginTitle || 'لوحة التحكم'}
            </h1>
            <p className="mt-2 text-sm text-rose-500">
              {t.adminLoginSubtitle || 'لوحة التحكم — أدخل كلمة المرور لإدارة المحتوى'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label={t.adminLoginPassword || 'كلمة المرور'}>
              <PasswordInput
                value={password}
                onChange={(v) => {
                  setPassword(v)
                  setError('')
                }}
                placeholder={t.adminLoginPlaceholder || 'أدخل كلمة المرور'}
              />
            </Field>
            {error ? (
              <p className="text-center text-sm text-rose-500">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-70 cursor-pointer"
            >
              {submitting ? (t.adminLoginVerifying || 'جاري التحقق...') : (t.adminLoginButton || 'دخول')}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-rose-400">
            <Link to={visitorPath} className="underline hover:text-rose-600">
              {t.backToVisitor || 'الذهاب لصفحة الزائر'}
            </Link>
          </p>
        </motion.div>
      </main>
    </div>
  )
}

export default function Dashboard() {
  const {
    isAdmin,
    adminPassword,
    adminLoginWithPassword,
    updateAdminPassword,
    adminLogout,
  } = useAdminAuth()
  const {
    content,
    musicSrc,
    isLoading,
    isDirty,
    syncStatus,
    syncError,
    updateField,
    updateNestedField,
    updateRoot,
    updateDate,
    updateMemory,
    addMemory,
    removeMemory,
    updateGalleryItem,
    addGalleryItem,
    removeGalleryItem,
    updateWishlistItem,
    addWishlistItem,
    removeWishlistItem,
    toggleWishlistItem,
    addCountdown,
    updateCountdown,
    removeCountdown,
    uploadMemoryImage,
    uploadGalleryImage,
    uploadMusic,
    addMusicTrack,
    removeMusic,
    updateMusicTrackTitle,
    musicUploadingIndex,
    musicUploadError,
    saveChanges,
    loadFromDatabase,
    verifyPassword,
    undo,
    redo,
    canUndo,
    canRedo,
    siteNotFound,
    getClientSlug,
    t,
  } = useContent()
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const [trackModes, setTrackModes] = useState({})
  const countdownsList = content?.countdowns || []

  const handleAdminLogin = async (password) => {
    // ✅ مسح جلسة الزائر عند تسجيل دخول الأدمن لمنع الدخول التلقائي للموقع
    const parts = window.location.pathname.split('/').filter(Boolean)
    const slug = parts[0] && parts[0] !== 'soulove-admin' && parts[0] !== 'api' && parts[0] !== 'dashboard' ? parts[0] : ''
    if (typeof sessionStorage !== 'undefined') {
      if (slug) {
        sessionStorage.removeItem(`romantic-site-authenticated-${slug}`)
        sessionStorage.removeItem(`romantic-site-skip-intro`)
      }
    }
    try {
      adminLoginWithPassword(password)
      await loadFromDatabase()
    } catch (err) {
      console.error('Failed to load database content during admin login:', err)
      setError(err?.message || 'تعذّر الاتصال بخادم قاعدة البيانات')
      adminLogout()
    }
  }

  const handleSave = async () => {
    if (!adminPassword) {
      adminLogout()
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const result = await saveChanges(adminPassword)
      if (result?.nextLoginPassword) {
        updateAdminPassword(result.nextLoginPassword)
      }
      setFeedbackModal({
        isOpen: true,
        type: 'success',
        title: 'تم حفظ البيانات بنجاح 💖',
        message: 'تم حفظ جميع التعديلات والتغييرات على خادم البيانات بنجاح!',
      })
    } catch (error) {
      const isPassError = error?.code === 'invalid_password' || error?.message?.includes('invalid_password')
      if (isPassError) {
        adminLogout()
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'كلمة المرور غير صحيحة ⚠️',
          message: 'يرجى إعادة تسجيل الدخول بكلمة المرور الحالية لحفظ البيانات.',
        })
      } else {
        setFeedbackModal({
          isOpen: true,
          type: 'error',
          title: 'فشل حفظ التعديلات ⚠️',
          message: error?.message || 'حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة مرة أخرى.',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    grantVisitorPreviewAccess()
    const parts = window.location.pathname.split('/').filter(Boolean)
    const slug = parts[0] && parts[0] !== 'soulove-admin' && parts[0] !== 'api' ? parts[0] : ''
    const targetUrl = slug ? `/${slug}` : '/'
    window.open(targetUrl, '_blank')
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = 'لديك تغييرات غير محفوظة، هل أنت تأكد من مغادرة الصفحة؟'
        return e.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [isDirty])

  if (!isAdmin) {
    return <AdminLoginForm onLogin={handleAdminLogin} />
  }

  if (isLoading) {
    return <ContentLoadingHearts />
  }

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <Section
            title={t.generalSettings}
            description={t.generalDesc}
          >
            <Field label={t.siteNameLabel} hint={content.language === 'en' || content.language === 'en-GB' ? 'Appears in browser tab and dashboard' : content.language === 'es' ? 'Aparece en la pestaña del navegador y el panel' : 'يظهر في تبويب المتصفح ولوحة التحكم'}>
              <TextInput
                value={content.siteName}
                onChange={(v) => {
                  updateRoot('siteName', v)
                }}
              />
            </Field>
            <Field
              label={t.visitorPasswordLabel}
              hint={content.language === 'en' || content.language === 'en-GB' ? 'The password used by your partner to open the gift' : content.language === 'es' ? 'La contraseña que usa tu pareja para abrir el regalo' : 'الكلمة التي يستخدمها شريكك لفتح الهدية'}
            >
              <PasswordInput
                showCopy={true}
                value={content.password}
                onChange={(v) => {
                  updateRoot('password', v)
                }}
              />
            </Field>
            <Field
              label={t.adminPasswordLabel}
            >
              <PasswordInput
                showCopy={true}
                value={content.adminPassword || ''}
                onChange={(v) => {
                  updateRoot('adminPassword', v)
                }}
              />
            </Field>

            <div className="border-b border-rose-100 pb-3">
              <h3 className="font-display text-base font-bold text-rose-900">
                المظهر والألوان
              </h3>
              <p className="mt-1 text-xs text-rose-400">
                اختر نمط ولون الموقع — خلفية الصفحة وقارئ الأغاني والأزرار تتغير ديناميكياً بالكامل حسب لون العميل
              </p>
            </div>

            <Field
              label="نمط خلفية الموقع"
              hint="اختر بين المظهر الفاتح الرومانسي أو المظهر الداكن الفخم"
            >
              <div className="grid grid-cols-2 gap-3 max-w-xs">
                <button
                  type="button"
                  onClick={() => updateField('appearance', 'mode', 'light')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border transition ${
                    (content.appearance?.mode ?? 'light') === 'light'
                      ? 'border-rose-400 bg-rose-50 text-rose-600 shadow-sm'
                      : 'border-rose-100 bg-white text-rose-400 hover:bg-rose-50/50'
                  }`}
                >
                  <span>☀️</span>
                  <span>فاتح (Light)</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateField('appearance', 'mode', 'dark')}
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-semibold border transition ${
                    content.appearance?.mode === 'dark'
                      ? 'border-rose-400 bg-slate-900 text-rose-300 shadow-sm'
                      : 'border-rose-100 bg-white text-rose-400 hover:bg-rose-50/50'
                  }`}
                >
                  <span>🌙</span>
                  <span>داكن (Dark)</span>
                </button>
              </div>
            </Field>

            <Field
              label="اللون الرئيسي"
              hint="اختر من درجات الألوان الجاهزة أو اضغط زر عجلة الألوان باللمس لاختيار أي لون"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-3 pt-1">
                  {[
                    '#e11d48', '#fb7185', '#f472b6', '#e879f9', '#c084fc', '#818cf8',
                    '#38bdf8', '#2dd4bf', '#34d399', '#fbbf24', '#f97316', '#ef4444'
                  ].map((color) => {
                    const isSelected = (content.appearance?.primaryColor || '#fb7185').toLowerCase() === color.toLowerCase()
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          updateField('appearance', 'primaryColor', color)
                        }}
                        className={`h-11 w-11 rounded-2xl border-2 border-white shadow-md transition-all duration-200 active:scale-90 ${
                          isSelected ? 'ring-2 ring-rose-500 ring-offset-2 scale-110' : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                        aria-label={`اختيار ${color}`}
                      />
                    )
                  })}
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-2.5">
                  <label className="relative flex flex-1 cursor-pointer items-center justify-between gap-3 rounded-xl bg-white px-4 py-2.5 shadow-sm border border-rose-100">
                    <span className="text-xs font-semibold text-rose-700">🎨 عجلة الألوان باللمس</span>
                    <input
                      type="color"
                      value={content.appearance?.primaryColor || '#fb7185'}
                      onChange={(e) => {
                        updateField('appearance', 'primaryColor', e.target.value)
                      }}
                      className="h-8 w-12 cursor-pointer rounded-lg border-none p-0 bg-transparent"
                    />
                  </label>
                </div>
              </div>
            </Field>

            <Field
              label="شفافية القلوب الطائرة"
              hint="كلما زادت، ظهرت القلوب أوضح في الخلفية"
            >
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={content.appearance?.heartOpacity ?? 0.65}
                onChange={(e) => {
                  updateField('appearance', 'heartOpacity', Number(e.target.value))
                }}
                className="w-full accent-rose-400"
              />
              <span className="text-xs text-rose-400">
                {Math.round((content.appearance?.heartOpacity ?? 0.65) * 100)}%
              </span>
            </Field>

            <Field
              label="رمز قلب الخلفية"
              hint="شكل القلب أو الإيموجي المستخدم في الخلفية المتحركة"
            >
              <TextInput
                value={content.appearance?.backgroundHeart ?? '♥'}
                onChange={(v) => {
                  updateField('appearance', 'backgroundHeart', v)
                }}
                maxLength={5}
              />
            </Field>

            <Field
              label="رمز قلب الدخول والانفجار"
              hint="شكل القلب أو الإيموجي المستخدم في شاشة الدخول والانفجارات"
            >
              <TextInput
                value={content.appearance?.pushHeart ?? '♥'}
                onChange={(v) => {
                  updateField('appearance', 'pushHeart', v)
                }}
                maxLength={5}
              />
            </Field>

            {/* Live Theme Preview Box */}
            <div className="mt-4 rounded-2xl border border-rose-100/80 bg-rose-50/40 p-4 space-y-2">
              <span className="text-xs font-bold text-rose-700 block">✨ معاينة مباشرة لمظهر ولون الصفحة:</span>
              <div className="rounded-2xl p-4 transition-all theme-neumorph-card flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full theme-neumorph-disc flex items-center justify-center text-white text-xs font-bold shadow-md">
                    {content.appearance?.backgroundHeart || '♥'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-rose-900">خلفية المظهر وقارئ الأغاني</p>
                    <p className="text-[10px] text-rose-600 font-semibold">تتغيّر تلقائياً وبشكل ديناميكي حسب اختيارك</p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold theme-neumorph-btn-active pointer-events-none shadow-sm">
                  لون الزر
                </span>
              </div>
            </div>
          </Section>
        )

      case 'music':
        const rawTracks = content.music?.tracks || []
        const tracksList = rawTracks.length > 0
          ? rawTracks
          : (content.music?.src
            ? [{ id: 'default', title: content.music.title || (content.language === 'en' || content.language === 'en-GB' ? 'Our Song' : content.language === 'es' ? 'Nuestra canción' : 'أغنيتنا'), fileName: content.music.fileName || 'romantic.mp3', src: content.music.src }]
            : [{ id: 'track-1', title: (content.language === 'en' || content.language === 'en-GB' ? 'Track 1' : content.language === 'es' ? 'Pista 1' : 'أغنية 1'), fileName: '', src: '' }])

        return (
          <Section
            title={t.musicSettings}
            description={t.musicDesc}
          >
            <div className="space-y-6">
              {tracksList.map((track, idx) => {
                const trackKey = track.id || idx
                const titleText = (track.title || '').toLowerCase()
                const defaultIsVoice = track.isVoice || titleText.includes('بصوتي') || titleText.includes('تسجيل') || titleText.includes('صوتي')
                const currentMode = trackModes[trackKey] || (defaultIsVoice ? 'voice' : 'file')

                return (
                  <div key={trackKey} className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-rose-400">
                        {currentMode === 'voice' 
                          ? (content.language === 'en' || content.language === 'en-GB' ? `Voice Message #${idx + 1}` : content.language === 'es' ? `Mensaje de voz #${idx + 1}` : `رسالة صوتية رقم ${idx + 1}`) 
                          : (content.language === 'en' || content.language === 'en-GB' ? `Track #${idx + 1}` : content.language === 'es' ? `Canción #${idx + 1}` : `الأغنية رقم ${idx + 1}`)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeMusic(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                        title={t.deleteBtn}
                      >
                        <Trash2 size={12} />
                        حذف
                      </button>
                    </div>

                    <Field label="عنوان الأغنية / الصوت">
                      <TextInput
                        value={track.title ?? ''}
                        onChange={(v) => {
                          updateMusicTrackTitle(idx, v)
                        }}
                        placeholder={content.language === 'en' || content.language === 'en-GB' ? 'Track title or voice message...' : content.language === 'es' ? 'Nombre de canción o mensaje de voz...' : 'اسم الأغنية أو الرسالة الصوتية...'}
                      />
                    </Field>

                    {track.src ? (
                      <div className="space-y-2">
                        <p className="text-xs text-rose-400 truncate">الملف: {track.fileName || 'ملف صوتي'}</p>
                        {(() => {
                          const audioSrc = track.localUrl || track.src
                          return (
                            <audio
                              controls
                              preload="auto"
                              src={audioSrc}
                              className="w-full h-8"
                              key={audioSrc}
                              onError={(e) => {
                                // Auto-retry with cache-busting on load error
                                const el = e.currentTarget
                                if (!el.dataset.retried && track.src) {
                                  el.dataset.retried = 'true'
                                  setTimeout(() => {
                                    el.src = track.src + (track.src.includes('?') ? '&' : '?') + 't=' + Date.now()
                                    el.load()
                                  }, 1000)
                                }
                              }}
                            />
                          )
                        })()}
                        <button
                          type="button"
                          onClick={() => {
                            updateMusicTrackTitle(idx, track.title)
                            uploadMusic(null, idx).catch(() => {})
                          }}
                          className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 underline"
                        >
                          تغيير أو إعادة رفع الصوت
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {musicUploadError?.index === idx && musicUploadError?.message ? (
                          <p className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                            {musicUploadError.message}
                          </p>
                        ) : null}

                        {currentMode === 'voice' ? (
                          <>
                            {/* Live Browser Voice Recorder */}
                            <VoiceRecorder
                              isUploading={musicUploadingIndex === idx}
                              onRecordingComplete={(recordedFile, recordedDuration) => {
                                uploadMusic(recordedFile, idx, recordedDuration).catch(() => {})
                              }}
                            />

                            <div className="pt-1 text-center">
                              <button
                                type="button"
                                onClick={() => setTrackModes((prev) => ({ ...prev, [trackKey]: 'file' }))}
                                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 underline inline-flex items-center gap-1"
                              >
                                <Music2 size={12} />
                                التبديل إلى رفع ملف صوتي جاهز من الجهاز 📁
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Prominent Direct File Upload Box for Songs */}
                            <div className="rounded-2xl border-2 border-dashed border-rose-200 bg-white p-5 text-center transition hover:border-rose-300 hover:bg-rose-50/50">
                              <label className="cursor-pointer flex flex-col items-center justify-center gap-2">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner">
                                  <Music2 size={22} />
                                </div>
                                <span className="text-xs font-bold text-rose-900">اختر ملف أغنية جاهز من جهازك 📁</span>
                                <span className="text-[11px] text-rose-400 font-medium">يدعم صيغ MP3, M4A, WAV, AAC وغيرهم</span>
                                <input
                                  type="file"
                                  accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.webm,.opus,.mpeg,.mpga"
                                  className="hidden"
                                  disabled={musicUploadingIndex !== null}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) {
                                      uploadMusic(file, idx).catch(() => {})
                                    }
                                    e.target.value = ''
                                  }}
                                />
                              </label>
                            </div>

                            <div className="pt-1 text-center">
                              <button
                                type="button"
                                onClick={() => setTrackModes((prev) => ({ ...prev, [trackKey]: 'voice' }))}
                                className="text-[11px] font-semibold text-rose-500 hover:text-rose-700 underline inline-flex items-center gap-1"
                              >
                                <Mic size={12} />
                                التبديل إلى تسجيل صوتك المباشر 🎙️
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}

              {tracksList.length < 7 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => addMusicTrack({ isVoice: false })}
                    className="w-full rounded-xl border border-dashed border-rose-200 py-3 text-xs font-semibold text-rose-600 transition hover:border-rose-300 hover:bg-rose-50 flex items-center justify-center gap-1.5"
                  >
                    <Plus size={15} />
                    {content.language === 'en' || content.language === 'en-GB' ? '+ Add new song 🎵' : content.language === 'es' ? '+ Añadir nueva canción 🎵' : '+ إضافة أغنية جديدة 🎵'}
                  </button>

                  <button
                    type="button"
                    onClick={() => addMusicTrack({ isVoice: true })}
                    className="w-full rounded-xl border border-dashed border-rose-300 bg-rose-50/50 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 flex items-center justify-center gap-1.5"
                  >
                    <Mic size={15} className="text-rose-500" />
                    {content.language === 'en' || content.language === 'en-GB' ? '+ Add voice recording 🎙️' : content.language === 'es' ? '+ Grabar mensaje de voz 🎙️' : '+ إضافة رسالة بصوتي 🎙️'}
                  </button>
                </div>
              )}
            </div>
          </Section>
        )

      case 'login':
        return (
          <Section
            title={t.loginPageSettings}
            description={t.loginDesc}
          >
            {[
              ['eyebrow', t.fields.eyebrow],
              ['title', t.fields.title],
              ['subtitle', t.fields.subtitle],
              ['passwordLabel', t.fields.passwordLabel],
              ['placeholder', t.fields.placeholder],
              ['button', t.fields.button],
              ['error', t.fields.error],
              ['footer', t.fields.footer],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                {key === 'subtitle' ? (
                  <TextArea
                    value={content.login?.[key] ?? ''}
                    onChange={(v) => {
                      updateField('login', key, v)
                    }}
                  />
                ) : (
                  <TextInput
                    value={content.login?.[key] ?? ''}
                    onChange={(v) => {
                      updateField('login', key, v)
                    }}
                  />
                )}
              </Field>
            ))}
          </Section>
        )

      case 'welcome':
        return (
          <Section title={t.welcomeSettings} description={t.welcomeDesc}>
            <Field label={t.fields.eyebrow}>
              <TextInput
                value={content.welcome.eyebrow}
                onChange={(v) => {
                  updateField('welcome', 'eyebrow', v)
                }}
              />
            </Field>
            <Field label={t.fields.title}>
              <TextInput
                value={content.welcome.title}
                onChange={(v) => {
                  updateField('welcome', 'title', v)
                }}
              />
            </Field>
            <Field label={t.fields.subtitle}>
              <TextArea
                value={content.welcome.subtitle}
                onChange={(v) => {
                  updateField('welcome', 'subtitle', v)
                }}
                rows={4}
              />
            </Field>
          </Section>
        )

      case 'story':
        return (
          <Section title={t.storySettings} description={t.storyDesc}>
            <Field label={t.fields.eyebrow}>
              <TextInput
                value={content.story.eyebrow}
                onChange={(v) => {
                  updateField('story', 'eyebrow', v)
                }}
              />
            </Field>
            <Field label={t.fields.title}>
              <TextInput
                value={content.story.title}
                onChange={(v) => {
                  updateField('story', 'title', v)
                }}
              />
            </Field>

            <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
              <p className="mb-3 text-sm font-semibold text-rose-700">{t.firstMeetingSec}</p>
              <div className="space-y-3">
                <Field label={t.fields.label}>
                  <TextInput
                    value={content.story.firstMeeting.label}
                    onChange={(v) => {
                      updateNestedField('story', 'firstMeeting', 'label', v)
                    }}
                  />
                </Field>
                <Field label={t.fields.firstMeeting}>
                  <DateInput
                    value={content.dates.firstMeeting}
                    onChange={(v) => {
                      updateDate('firstMeeting', v)
                    }}
                  />
                </Field>
                <Field label={t.fields.description}>
                  <TextArea
                    value={content.story.firstMeeting.description}
                    onChange={(v) => {
                      updateNestedField('story', 'firstMeeting', 'description', v)
                    }}
                  />
                </Field>
              </div>
            </div>

            <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
              <p className="mb-3 text-sm font-semibold text-rose-700">{t.loveConfessionSec}</p>
              <div className="space-y-3">
                <Field label={t.fields.label}>
                  <TextInput
                    value={content.story.loveConfession.label}
                    onChange={(v) => {
                      updateNestedField('story', 'loveConfession', 'label', v)
                    }}
                  />
                </Field>
                <Field label={t.fields.loveConfession}>
                  <DateInput
                    value={content.dates.loveConfession}
                    onChange={(v) => {
                      updateDate('loveConfession', v)
                    }}
                  />
                </Field>
                <Field label={t.fields.message}>
                  <TextArea
                    value={content.story.loveConfession.message}
                    onChange={(v) => {
                      updateNestedField('story', 'loveConfession', 'message', v)
                    }}
                  />
                </Field>
              </div>
            </div>

            <p className="text-xs text-rose-400">
              {content.language === 'en' || content.language === 'en-GB' ? 'Relationship milestones appear only on Our Story page.' : content.language === 'es' ? 'Los hitos de la relación aparecen solo en la página de nuestra historia.' : 'ذكريات القصة تظهر في صفحة القصة فقط.'}
            </p>
          </Section>
        )

      case 'memories':
        return (
          <Section
            title={t.memoriesTab}
            description={content.language === 'en' || content.language === 'en-GB' ? 'Stories + dates in timeline — Our Story page only' : content.language === 'es' ? 'Historias + fechas en la línea de tiempo — Solo página de historia' : 'نص + تاريخ في خط الزمن — صفحة القصة فقط'}
          >
            <div className="space-y-4">
              {content.memories.map((memory, index) => (
                <MemoryEditor
                  key={memory.id}
                  memory={memory}
                  index={index}
                  itemLabel="ذكرى"
                  imageHint="صورة اختيارية (تُضغط تلقائياً)"
                  onChange={(id, patch) => {
                    updateMemory(id, patch)
                  }}
                  onImageUpload={async (id, file) => {
                    try {
                      setSaveMessage('جاري رفع وضغط الصورة...')
                      await uploadMemoryImage(id, file)
                      setSaveMessage('✓ تم رفع الصورة بنجاح!')
                    } catch (err) {
                      console.error('Upload error:', err)
                      setSaveMessage(`✗ فشل الرفع: ${err.message || 'مشكلة في الاتصال بسيرفر التخزين'}`)
                    }
                  }}
                  onImageRemove={(id) => {
                    updateMemory(id, { image: '' })
                  }}
                  onRemove={removeMemory}
                  canRemove={content.memories.length > 1}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                addMemory()
              }}
              className="w-full rounded-xl border border-dashed border-rose-200 py-3 text-sm font-medium text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
            >
              + إضافة ذكرى للقصة
            </button>
          </Section>
        )

      case 'gallery':
        return (
          <>
            <Section title="عناوين المعرض" description="نصوص صفحة الألبوم">
              <Field label="العنوان الصغير">
                <TextInput
                  value={content.gallery.eyebrow}
                  onChange={(v) => {
                    updateField('gallery', 'eyebrow', v)
                  }}
                />
              </Field>
              <Field label="العنوان الرئيسي">
                <TextInput
                  value={content.gallery.title}
                  onChange={(v) => {
                    updateField('gallery', 'title', v)
                  }}
                />
              </Field>
            </Section>

            <div className="mt-4">
              <Section
                title="صور الألبوم"
                description="صورة + تاريخ + وصف — صفحة المعرض فقط"
              >
                <div className="space-y-4">
                  {(content.galleryItems ?? []).map((item, index) => (
                    <MemoryEditor
                      key={item.id}
                      memory={item}
                      index={index}
                      itemLabel="صورة"
                      imageHint="رفع صورة"
                      onChange={(id, patch) => {
                        updateGalleryItem(id, patch)
                      }}
                      onImageUpload={async (id, file) => {
                        try {
                          setSaveMessage('جاري رفع وضغط الصورة...')
                          await uploadGalleryImage(id, file)
                          setSaveMessage('✓ تم رفع الصورة بنجاح!')
                        } catch (err) {
                          console.error('Upload error:', err)
                          setSaveMessage(`✗ فشل الرفع: ${err.message || 'مشكلة في الاتصال بسيرفر التخزين'}`)
                        }
                      }}
                      onImageRemove={(id) => {
                        updateGalleryItem(id, { image: '' })
                      }}
                      onRemove={removeGalleryItem}
                      canRemove={(content.galleryItems ?? []).length > 0}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    addGalleryItem()
                  }}
                  className="w-full rounded-xl border border-dashed border-rose-200 py-3 text-sm font-medium text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
                >
                  + إضافة صورة للمعرض
                </button>
              </Section>
            </div>
          </>
        )

      case 'countdowns':
        return (
          <Section
            title="العدادات التنازلية ⏳"
            description="إدارة ومتابعة العدادات التنازلية المباشرة للمناسبات القادمة"
          >
            <div className="space-y-4">
              {countdownsList.map((timer, idx) => (
                <div
                  key={timer.id || idx}
                  className="rounded-2xl border border-rose-100 bg-rose-50/40 p-4 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-rose-100/60 pb-2">
                    <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                      <Clock size={14} className="text-rose-500" />
                      عداد رقم #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCountdown(idx)}
                      className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      حذف العداد
                    </button>
                  </div>

                  <Field label="عنوان المناسبة">
                    <TextInput
                      value={timer.title || ''}
                      onChange={(v) => updateCountdown(idx, 'title', v)}
                      placeholder="مثال: عيد ميلادك 🎂"
                    />
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="تاريخ المناسبة">
                      <DateInput
                        value={timer.date || ''}
                        onChange={(v) => updateCountdown(idx, 'date', v)}
                      />
                    </Field>

                    <Field label="وقت المناسبة">
                      <TextInput
                        value={timer.time || '00:00'}
                        onChange={(v) => updateCountdown(idx, 'time', v)}
                        placeholder="00:00"
                      />
                    </Field>
                  </div>

                  <Field label="وصف أو رسالة المناسبة">
                    <TextArea
                      value={timer.description || ''}
                      onChange={(v) => updateCountdown(idx, 'description', v)}
                      rows={2}
                      placeholder="رسالة تظهر مع العداد التنازلي"
                    />
                  </Field>
                </div>
              ))}

              <button
                type="button"
                onClick={addCountdown}
                className="w-full rounded-xl border border-dashed border-rose-300 bg-rose-50/50 py-3 text-xs font-bold text-rose-700 transition hover:bg-rose-100 flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                + إضافة عداد تنازلي جديد ⏳
              </button>
            </div>
          </Section>
        )

      case 'final':
        return (
          <Section title="الصفحة الأخيرة" description="الرسالة الختامية">
            <Field label="العنوان الصغير">
              <TextInput
                value={content.final.eyebrow}
                onChange={(v) => {
                  updateField('final', 'eyebrow', v)
                }}
              />
            </Field>
            <Field label="العنوان الرئيسي">
              <TextInput
                value={content.final.title}
                onChange={(v) => {
                  updateField('final', 'title', v)
                }}
              />
            </Field>
            <Field label="الرسالة">
              <TextArea
                value={content.final.text}
                onChange={(v) => {
                  updateField('final', 'text', v)
                }}
                rows={6}
              />
            </Field>
          </Section>
        )

      case 'wishlist':
        return (
          <Section
            title="قائمة الأمنيات"
            description="حاجات نفسي نعملها سوا — تقدر تضيف وتعدل وتمسح العناصر"
          >
            <div className="space-y-4">
              {(content.wishlist ?? []).map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-400">
                      {(content.language === 'en' || content.language === 'en-GB' ? 'Item' : content.language === 'es' ? 'Elemento' : 'عنصر')} #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWishlistItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title={content.language === 'es' ? 'Eliminar' : 'Delete'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Field label={content.language === 'en' || content.language === 'en-GB' ? 'Wish text' : content.language === 'es' ? 'Texto del deseo' : 'نص الأمنية'}>
                    <TextInput
                      value={item.text ?? ''}
                      onChange={(v) => {
                        updateWishlistItem(item.id, { text: v })
                      }}
                      placeholder={t.wishlistTextPlaceholder}
                    />
                  </Field>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={(e) => {
                        updateWishlistItem(item.id, { completed: e.target.checked })
                      }}
                      className="h-4 w-4 rounded border-rose-200 text-rose-500 focus:ring-rose-200"
                    />
                    <span className="text-xs text-rose-800 font-medium">{t.wishlistCompleted}</span>
                  </label>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                addWishlistItem('')
              }}
              className="mt-4 w-full rounded-xl border border-dashed border-rose-200 py-3 text-sm font-medium text-rose-500 transition hover:border-rose-300 hover:bg-rose-50"
            >
              {t.addWishlistBtn}
            </button>
          </Section>
        )
      default:
        return null
    }
  }

  const activeSlug = getClientSlug()
  const visitorPath = activeSlug ? `/${activeSlug}` : '/'

  const tabs = TABS.map(tab => ({
    ...tab,
    label: t[`${tab.id}Tab`] || tab.label
  }))

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-rose-400">{content.siteName}</p>
            <h1 className="font-display text-2xl font-bold text-rose-900">
              {t.dashboardTitle}
            </h1>
            <p className="text-sm text-rose-500">
              {saveMessage ||
                (isDirty
                  ? (content.language === 'en' || content.language === 'en-GB' ? '● You have unsaved changes — click Save' : content.language === 'es' ? '● Tienes cambios sin guardar — haz clic en Guardar' : '● لديك تغييرات غير محفوظة — اضغط «حفظ»')
                  : (content.language === 'en' || content.language === 'en-GB' ? '✓ Content saved successfully' : content.language === 'es' ? '✓ Contenido guardado con éxito' : '✓ المحتوى محفوظ على قاعدة البيانات'))}
              <span className="mt-1 block text-xs">
                {syncStatus === 'loading' && (content.language === 'en' || content.language === 'en-GB' ? '⏳ Loading database content...' : content.language === 'es' ? '⏳ Cargando contenido...' : '⏳ جاري التحميل من قاعدة البيانات...')}
                {syncStatus === 'saving' && `💾 ${t.saving}`}
                {syncStatus === 'error' && (content.language === 'en' || content.language === 'en-GB' ? '⚠️ Connection problem' : content.language === 'es' ? '⚠️ Problema de conexión' : '⚠️ مشكلة في الاتصال')}
                {syncError ? ` — ${syncError}` : ''}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title={content.language === 'es' ? 'Rehacer' : 'Redo'}
            >
              <Redo size={14} />
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title={content.language === 'es' ? 'Deshacer' : 'Undo'}
            >
              <Undo size={14} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || syncStatus === 'loading' || !isDirty}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 px-3.5 py-2 text-xs font-semibold text-white shadow-md transition hover:from-rose-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? t.saving : (content.language === 'en' || content.language === 'en-GB' ? 'Save' : content.language === 'es' ? 'Guardar' : 'حفظ')}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
              title={content.language === 'es' ? 'Vista previa' : 'Preview site'}
            >
              <ExternalLink size={14} />
              <span className="hidden sm:inline">{content.language === 'es' ? 'Vista previa' : (content.language === 'en' || content.language === 'en-GB' ? 'Preview' : 'معاينة')}</span>
            </button>
 
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/90 px-3 py-2 text-xs font-bold text-rose-700 shadow-sm transition hover:bg-rose-100 active:scale-95"
              title={content.language === 'es' ? 'Código QR' : 'QR Code'}
            >
              <QrCode size={14} className="text-rose-500" />
              <span>{content.language === 'es' ? 'Código QR 📱' : (content.language === 'en' || content.language === 'en-GB' ? 'QR Code 📱' : 'كود QR 📱')}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLogoutModal(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 transition hover:bg-rose-200"
              title={t.logoutBtn}
              aria-label={t.logoutBtn}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        <PWAInstallBanner />

        <nav className="romantic-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${activeTab === id
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/80 text-rose-600 dark:text-rose-300 hover:bg-white dark:hover:bg-slate-800 border border-rose-100/60 dark:border-rose-900/40'
                }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {renderTab()}
        </motion.div>

        <p className="mt-8 text-center text-xs text-rose-400">
          رابط الزائر:{' '}
          <Link to={visitorPath} className="underline hover:text-rose-600">
            صفحة الزائر
          </Link>
        </p>

        {showLogoutModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl bg-white border border-rose-100 p-6 text-center shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto">
                <LogOut size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-rose-900">تأكيد تسجيل الخروج</h3>
                <p className="text-xs text-rose-500 mt-1">هل أنت متأكد من رغبتك في الخروج من لوحة التحكم؟</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(false)
                    adminLogout()
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-500 text-white text-xs font-semibold shadow-md transition-all hover:from-rose-500 hover:to-pink-600"
                >
                  تسجيل الخروج
                </button>
              </div>
            </div>
          </div>
        )}

        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
        />

        <QRCodeModal
          isOpen={showQRModal}
          onClose={() => setShowQRModal(false)}
          slug={window.location.pathname.split('/').filter(Boolean)[0] || 'default'}
        />
      </div>
    </div>
  )
}
