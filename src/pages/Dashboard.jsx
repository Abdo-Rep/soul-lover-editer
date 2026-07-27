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
  Undo,
  Redo,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import ContentLoadingHearts from '../components/ContentLoadingHearts'
import FeedbackModal from '../components/FeedbackModal'
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
  { id: 'final', label: 'الصفحة الأخيرة', icon: Heart },
]

function AdminLoginForm({ onLogin }) {
  const { content, isLoading, isSupabaseConfigured, verifyPassword } = useContent()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (isLoading || submitting) return

    if (!isSupabaseConfigured) {
      setError('تعذّر الاتصال بالخادم')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const isValid = await verifyPassword(password)
      if (!isValid) {
        setError('كلمة المرور غير صحيحة')
        return
      }

      await onLogin(password)
    } catch {
      setError('تعذّر التحقق — حاول مرة أخرى')
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return <ContentLoadingHearts />
  }

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
              {content.siteName}
            </h1>
            <p className="mt-2 text-sm text-rose-500">
              لوحة التحكم — أدخل كلمة المرور لإدارة المحتوى
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="كلمة المرور">
              <PasswordInput
                value={password}
                onChange={(v) => {
                  setPassword(v)
                  setError('')
                }}
                placeholder="أدخل كلمة المرور"
              />
            </Field>
            {error ? (
              <p className="text-center text-sm text-rose-500">{error}</p>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 py-3 text-sm font-semibold text-white shadow-md disabled:opacity-70"
            >
              {submitting ? 'جاري التحقق...' : 'دخول'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-rose-400">
            <Link to="/" className="underline hover:text-rose-600">
              الذهاب لصفحة الزائر
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
    isSupabaseConfigured,
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
    uploadMemoryImage,
    uploadGalleryImage,
    uploadMusic,
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
  } = useContent()
  const [activeTab, setActiveTab] = useState('general')
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: '',
  })

  const handleAdminLogin = async (password) => {
    adminLoginWithPassword(password)
    await loadFromDatabase()
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
    window.open('/', '_blank')
  }

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
            title="إعدادات عامة"
            description="اسم الموقع، كلمة المرور، والتواريخ المهمة"
          >
            <Field label="اسم الموقع" hint="يظهر في تبويب المتصفح ولوحة التحكم">
              <TextInput
                value={content.siteName}
                onChange={(v) => {
                  updateRoot('siteName', v)
                }}
              />
            </Field>
            <Field
              label="كلمة مرور الموقع (للزوار)"
              hint="الكلمة التي يستخدمها شريكك لفتح الهدية"
            >
              <PasswordInput
                value={content.password}
                onChange={(v) => {
                  updateRoot('password', v)
                }}
              />
            </Field>
            <Field
              label="كلمة مرور لوحة التحكم (الداشبورد)"
            >
              <PasswordInput
                value={content.adminPassword || ''}
                onChange={(v) => {
                  updateRoot('adminPassword', v)
                }}
              />
            </Field>

            <div>
              <h3 className="text-sm font-bold text-rose-700">
                الهوية البصرية
              </h3>
              <p className="mt-1 text-xs text-rose-400">
                اختر نمط ولون الموقع — باقي الدرجات تتولّد تلقائياً منه
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
          </Section>
        )

      case 'music':
        const rawTracks = content.music?.tracks || []
        const tracksList = Array.from({ length: 20 }, (_, idx) => {
          if (rawTracks[idx]) return rawTracks[idx]
          if (idx === 0 && content.music?.src) {
            return {
              id: 'default',
              title: content.music.title || 'أغنيتنا',
              fileName: content.music.fileName || 'romantic.mp3',
              src: content.music.src,
            }
          }
          return {
            id: `slot-${idx}`,
            title: `أغنية ${idx + 1}`,
            fileName: '',
            src: '',
          }
        })

        return (
          <Section
            title="الموسيقى"
            description="يمكنك رفع وتسمية حتى 20 ملف صوتي تعمل كقائمة تشغيل متتالية"
          >
            <div className="space-y-6">
              {tracksList.map((track, idx) => (
                <div key={track.id || idx} className="rounded-2xl border border-rose-100 bg-rose-50/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-400">الأغنية رقم {idx + 1}</span>
                    {track.src && (
                      <button
                        type="button"
                        onClick={() => removeMusic(idx)}
                        className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold"
                      >
                        <Trash2 size={12} />
                        حذف الملف
                      </button>
                    )}
                  </div>
                  
                  <Field label="عنوان الأغنية">
                    <TextInput
                      value={track.title}
                      onChange={(v) => {
                        updateMusicTrackTitle(idx, v)
                      }}
                    />
                  </Field>
                  
                  {track.src ? (
                    <div className="space-y-2">
                      <p className="text-xs text-rose-400 truncate">الملف: {track.fileName}</p>
                      <audio controls src={track.src} className="w-full h-8" key={track.src} />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {musicUploadError?.index === idx && musicUploadError?.message ? (
                        <p className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600">
                          {musicUploadError.message}
                        </p>
                      ) : null}
                      <label
                        className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-4 text-xs transition ${musicUploadingIndex === idx
                            ? 'border-rose-300 bg-rose-50 text-rose-500'
                            : 'border-rose-200 bg-rose-50/50 text-rose-500 hover:border-rose-300'
                          } ${musicUploadingIndex !== null ? 'pointer-events-none opacity-80' : ''}`}
                      >
                        {musicUploadingIndex === idx ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-200 border-t-rose-500" />
                            <span className="font-medium">جاري الرفع...</span>
                          </>
                        ) : (
                          <>
                            <Music2 size={14} />
                            <span>اضغط لرفع ملف صوتي لهذه الأغنية</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="audio/*,.mp3,.m4a,.aac,.wav,.ogg,.flac,.webm,.opus,.mpeg,.mpga"
                          className="hidden"
                          disabled={musicUploadingIndex !== null}
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              uploadMusic(file, idx).catch(() => { })
                            }
                            e.target.value = ''
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )

      case 'login':
        return (
          <Section
            title="صفحة دخول الزائر"
            description="النصوص التي تظهر عند فتح الهدية (الصفحة الرئيسية)"
          >
            {[
              ['eyebrow', 'العنوان الصغير'],
              ['title', 'العنوان الرئيسي'],
              ['subtitle', 'الوصف'],
              ['passwordLabel', 'تسمية كلمة المرور'],
              ['placeholder', 'نص الحقل الفارغ'],
              ['button', 'نص الزر'],
              ['error', 'رسالة الخطأ'],
              ['footer', 'نص التذييل'],
            ].map(([key, label]) => (
              <Field key={key} label={label}>
                {key === 'subtitle' ? (
                  <TextArea
                    value={content.login[key]}
                    onChange={(v) => {
                      updateField('login', key, v)
                    }}
                  />
                ) : (
                  <TextInput
                    value={content.login[key]}
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
          <Section title="صفحة الترحيب" description="أول صفحة بعد الدخول">
            <Field label="تاريخ بداية العلاقة">
              <DateInput
                value={content.dates.relationshipStart}
                onChange={(v) => {
                  updateDate('relationshipStart', `${v}T00:00:00`)
                }}
              />
            </Field>
            <Field label="العنوان الصغير">
              <TextInput
                value={content.welcome.eyebrow}
                onChange={(v) => {
                  updateField('welcome', 'eyebrow', v)
                }}
              />
            </Field>
            <Field label="العنوان الرئيسي">
              <TextInput
                value={content.welcome.title}
                onChange={(v) => {
                  updateField('welcome', 'title', v)
                }}
              />
            </Field>
            <Field label="النص">
              <TextArea
                value={content.welcome.subtitle}
                onChange={(v) => {
                  updateField('welcome', 'subtitle', v)
                }}
                rows={4}
              />
            </Field>
            <Field label="زر التالي">
              <TextInput
                value={content.welcome.nextButton}
                onChange={(v) => {
                  updateField('welcome', 'nextButton', v)
                }}
              />
            </Field>
          </Section>
        )

      case 'story':
        return (
          <Section title="صفحة القصة" description="العناوين ومحتوى الخط الزمني">
            <Field label="العنوان الصغير">
              <TextInput
                value={content.story.eyebrow}
                onChange={(v) => {
                  updateField('story', 'eyebrow', v)
                }}
              />
            </Field>
            <Field label="العنوان الرئيسي">
              <TextInput
                value={content.story.title}
                onChange={(v) => {
                  updateField('story', 'title', v)
                }}
              />
            </Field>

            <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-4">
              <p className="mb-3 text-sm font-semibold text-rose-700">أول لقاء</p>
              <div className="space-y-3">
                <Field label="التسمية">
                  <TextInput
                    value={content.story.firstMeeting.label}
                    onChange={(v) => {
                      updateNestedField('story', 'firstMeeting', 'label', v)
                    }}
                  />
                </Field>
                <Field label="تاريخ أول لقاء">
                  <DateInput
                    value={content.dates.firstMeeting}
                    onChange={(v) => {
                      updateDate('firstMeeting', v)
                    }}
                  />
                </Field>
                <Field label="الوصف">
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
              <p className="mb-3 text-sm font-semibold text-rose-700">اعتراف الحب</p>
              <div className="space-y-3">
                <Field label="التسمية">
                  <TextInput
                    value={content.story.loveConfession.label}
                    onChange={(v) => {
                      updateNestedField('story', 'loveConfession', 'label', v)
                    }}
                  />
                </Field>
                <Field label="تاريخ الاعتراف بالحب">
                  <DateInput
                    value={content.dates.loveConfession}
                    onChange={(v) => {
                      updateDate('loveConfession', v)
                    }}
                  />
                </Field>
                <Field label="الرسالة">
                  <TextArea
                    value={content.story.loveConfession.message}
                    onChange={(v) => {
                      updateNestedField('story', 'loveConfession', 'message', v)
                    }}
                  />
                </Field>
              </div>
            </div>

            <Field label="زر الذكريات">
              <TextInput
                value={content.story.memoriesButton}
                onChange={(v) => {
                  updateField('story', 'memoriesButton', v)
                }}
              />
            </Field>
            <p className="text-xs text-rose-400">
              ذكريات القصة تظهر في صفحة Our Story فقط — صور الألبوم في تبويب المعرض.
            </p>
          </Section>
        )

      case 'memories':
        return (
          <Section
            title="ذكريات القصة"
            description="نص + تاريخ في خط الزمن — صفحة Our Story فقط"
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
                description="صورة + تاريخ + وصف — صفحة المعرض فقط (تُضغط تلقائياً عند الرفع)"
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
                      عنصر #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeWishlistItem(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-400 transition hover:bg-rose-50 hover:text-rose-600"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <Field label="نص الأمنية">
                    <TextInput
                      value={item.text}
                      onChange={(v) => {
                        updateWishlistItem(item.id, { text: v })
                      }}
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
                    <span className="text-xs text-rose-800 font-medium">تم إنجازها</span>
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
              + إضافة عنصر جديد لقائمة الأمنيات
            </button>
          </Section>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-dvh overflow-x-hidden">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-rose-400">{content.siteName}</p>
            <h1 className="font-display text-2xl font-bold text-rose-900">
              لوحة التحكم
            </h1>
            <p className="text-sm text-rose-500">
              {saveMessage ||
                (isDirty
                  ? '● لديك تغييرات غير محفوظة — اضغط «حفظ»'
                  : '✓ المحتوى محفوظ على قاعدة البيانات')}
              {isSupabaseConfigured ? (
                <span className="mt-1 block text-xs">
                  {syncStatus === 'loading' && '⏳ جاري التحميل من قاعدة البيانات...'}
                  {syncStatus === 'saving' && '💾 جاري الحفظ...'}
                  {syncStatus === 'error' && '⚠️ مشكلة في الاتصال'}
                  {syncError ? ` — ${syncError}` : ''}
                </span>
              ) : (
                <span className="mt-1 block text-xs text-rose-400">
                  Supabase غير مُعدّ — راجع ملف .env
                </span>
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title="إعادة التعديل"
            >
              <Redo size={14} />
            </button>
            <button
              type="button"
              onClick={undo}
              disabled={!canUndo}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 bg-white text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-40 disabled:pointer-events-none active:scale-95"
              title="رجوع عن آخر تعديل"
            >
              <Undo size={14} />
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || syncStatus === 'loading' || !isDirty}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-400 to-pink-400 px-4 py-2 text-xs font-semibold text-white shadow-md transition hover:from-rose-500 hover:to-pink-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save size={14} />
              {isSaving ? 'جاري الحفظ...' : 'حفظ'}
            </button>
            <button
              type="button"
              onClick={handlePreview}
              className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
            >
              <ExternalLink size={14} />
              معاينة الموقع
            </button>
            <button
              type="button"
              onClick={adminLogout}
              className="flex items-center gap-1.5 rounded-xl bg-rose-100 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-200"
            >
              <LogOut size={14} />
              خروج
            </button>
          </div>
        </header>

        <nav className="romantic-scrollbar mb-6 flex gap-2 overflow-x-auto pb-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition ${activeTab === id
                  ? 'bg-gradient-to-r from-rose-400 to-pink-400 text-white shadow-md'
                  : 'bg-white/80 text-rose-600 hover:bg-white'
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
          <Link to="/" className="underline">
            الدومين الرئيسي
          </Link>
        </p>

        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
          type={feedbackModal.type}
          title={feedbackModal.title}
          message={feedbackModal.message}
        />
      </div>
    </div>
  )
}
