// Default editable data for the landing page
export const defaultLandingData = {
  // Pixel & Conversions API Settings
  pixels: {
    metaPixelId: '', // e.g. 123456789012345
    metaCapiToken: '', // Meta Conversions API Access Token from Events Manager
    metaTestEventCode: '', // e.g. TEST12345
    tiktokPixelId: '',
  },

  // Demo Settings
  demo: {
    url: 'https://soul-lover-gules.vercel.app/ssss',
    password: 'love',
    hintText: '🔑 كلمة السر لتجربة الموقع الحي بالأسفل هي:',
  },

  // Hero Section
  hero: {
    badge: 'الهدية الأكثر رومانسية وابتكاراً لعام 2026 🎁',
    titleLine1: 'اجعل قصة حبكم تعيش للأبد',
    titleLine2: 'في موقع إلكتروني خاص بكما 💖',
    subtitle: 'موقع محمي بكلمة سر يجمع أجمل لحظاتكم، أغانيكم، رسائلكم الصوتية، عدادات أهم أيامكم، وقائمة أمنيات تفاعلية مع كود QR مطبوع يفتح بلمسة واحدة.',
    trustBadge: 'أكثر من 1,500+ عميل سعيد 💖',
  },

  // Features Section (الكروت الستة)
  featuresSection: {
    badge: 'كل ما تحتاجه لهدية استثنائية 🔥',
    title: 'مميزات حصرية تجعل هديتك ذكرى لا تُنسى أبداً',
    subtitle: 'تم تصميم كل تفصيلة في الموقع لتبهر الطرف الآخر وتترك أثراً عاطفياً عميقاً من أول ثانية يفتح فيها الرابط.',
    items: [
      {
        icon: 'Lock',
        title: '🔒 قفل وخصوصية تامة',
        desc: 'موقعكم محمي بكلمة سر خاصة لا يستطيع أحد الدخول إليها إلا من تشاركون معه الرمز.',
      },
      {
        icon: 'Music',
        title: '🎵 مشغل موسيقى ورسائل صوتية',
        desc: 'ارفع أغنيتكم المفضلة أو سجل رسالة بصوتك تعبر فيها عن مشاعرك لتعمل في الخلفية بنقاء 3D.',
      },
      {
        icon: 'Calendar',
        title: '⏳ عدادات أهم أيامكم',
        desc: 'عدادات حية تحسب بالثواني والأيام منذ أول نظرة، أول يوم اتقابلتم، وحتى موعد فرحكم.',
      },
      {
        icon: 'Heart',
        title: '📸 شريط ذكريات وقصة حبكم',
        desc: 'معرض تفاعلي يعرض لحظاتكم وصوركم وكلماتكم خطوة بخطوة مع تأثيرات تقريب ناعمة.',
      },
      {
        icon: 'Sparkles',
        title: '✨ قائمة أمنيات تفاعلية (Bucket List)',
        desc: 'اكتبوا كل الأهداف والسفريات والأحلام التي تتمنون عيشها سوا، وقوموا بالتعليم عليها كلما حققتم حلماً.',
      },
      {
        icon: 'QrCode',
        title: '📱 كرت QR فخم للهدية',
        desc: 'كود QR أنيق جاهز للطباعة أو الإرسال يفتح الموقع على هاتف شريكك في ثانية واحدة بدون كتابة روابط.',
      },
    ],
  },

  // Steps Section (كيف يعمل في 3 خطوات)
  stepsSection: {
    badge: 'سهل وسريع ⚡',
    title: 'كيف يعمل في 3 خطوات بسيطة؟',
    subtitle: 'لا تحتاج لأي خبرة تقنية، نحن نجهز كل شيء من أجلك ونسلمك الموقع جاهزاً لتقديمه كأفخم هدية.',
    items: [
      {
        num: '01',
        title: 'أرسل الأسماء والتواريخ',
        desc: 'اكتب اسمك واسم شريكك، واختر تاريخ أول لقاء أو الخطوبة أو أي تاريخ مميز بينكما.',
      },
      {
        num: '02',
        title: 'اختر الأغنية والصور',
        desc: 'أضف أغنيتكم المفضلة، صور ذكرياتكم، ورسالتك الرومانسية أو بصوتك الخاص.',
      },
      {
        num: '03',
        title: 'استلم موقعكم وكرت الـ QR',
        desc: 'يتم تجهيز الموقع وإرسال الرابط المحمي بكلمة سر وكود QR عالي الدقة جاهز للمفاجأة فوراً!',
      },
    ],
  },

  // Single VIP Pricing Card
  pricing: {
    badge: 'عرض خاص ومحدود اليوم فقط 🔥',
    packageName: 'باقة الحب المتكاملة VIP 👑',
    subtitle: 'تشمل جميع المميزات الحصرية مدى الحياة بدون أي اشتراكات شهرية',
    price: '399',
    oldPrice: '650',
    discountText: 'خصم حصري لفترة محدودة ⏳',
    features: [
      'رابط موقع خاص ومحمي بكلمة سر باسمكما مدى الحياة (Lifetime)',
      'مشغل موسيقى لأغانيكم المفضلة + رسائل صوتية بصوتك 🎙️',
      'شريط ذكريات كامل ومعرض صور عالي الدقة 📸',
      'عدادات حية بالثواني والأيام لجميع تواريخكم ومناسباتكم ⏳',
      'قائمة أمنيات تفاعلية (Bucket List) قابلة للتعديل والتعليم ✅',
      'كرت كود QR فخم بتصميم رومانسي جاهز للطباعة والمفاجأة 🎁',
      'لوحة تحكم خاصة لتعديل وتحديث الصور والكلمات في أي وقت',
      'دعم فني وتجهيز فوري وتسليم خلال 30 دقيقة فقط',
    ],
    buttonText: 'اطلب موقعك الآن واستلم خلال 30 دقيقة 🚀',
  },

  // Reviews Section
  reviewsSection: {
    badge: 'تجارب حقيقية ⭐',
    title: 'أكثر من 1,500+ عميل سعيد أحبوا تجربتهم معنا',
    subtitle: 'قصص سعادة حقيقية بدأت بهدية مميزة وموقع يحفظ كل الذكريات للأبد.',
    items: [
      {
        name: 'سارة & أحمد',
        rating: 5,
        date: 'منذ يومين',
        comment: 'بجد أحسن هدية عملتها لخطيبي، فرح جداً لما فتح الـ QR ولقى الأغنية اللي بنحبها وصورنا سوا، رد فعله كان لا يُقدّر بثمن! شكراً ليكم بجد 💖',
      },
      {
        name: 'محمد & ميار',
        rating: 5,
        date: 'منذ أسبوع',
        comment: 'الفكرة عبقرية وجودة الموقع والتأثيرات وسرعة الفتح على الموبايل فاقت كل توقعاتي! والجميل إننا نقدر نعدل ونضيف صور جديدة براحتنا 🌟',
      },
      {
        name: 'نورهان & طارق',
        rating: 5,
        date: 'منذ 3 أسابيع',
        comment: 'أول مرة أشوف فكرة هدية تجمع بين التكنولوجيا والرومانسية بالشكل ده، العدادات التنازلية وقائمة الأمنيات خلتنا نتحمس لكل خطوة جاية في حياتنا 😍',
      },
    ],
  },

  // FAQ Section
  faqsSection: {
    badge: 'إجابات فورية 💡',
    title: 'الأسئلة الشائعة',
    subtitle: 'كل ما تحتاج معرفته عن كيفية عمل الموقع وتسليمه',
    items: [
      {
        q: 'كم من الوقت يستغرق تجهيز واستلام موقعنا؟',
        a: 'يتم تجهيز وبرمجة موقعكم الخاص وإرسال رابط الدخول وكود الـ QR خلال أقل من 15 إلى 30 دقيقة فقط من تأكيد الطلب!',
      },
      {
        q: 'هل الموقع محمي بكلمة سر ولا يراه أحد غيرنا؟',
        a: 'نعم بكل تأكيد! الموقع محمي بنظام أمان وتشفير كامل، ولا يمكن لأي شخص الدخول إليه أو رؤية الصور إلا بإدخال كلمة السر الخاصة بكما.',
      },
      {
        q: 'هل يمكنني تعديل الصور أو النصوص أو الأغاني بعد استلام الموقع؟',
        a: 'نعم، نوفر لك لوحة تحكم خاصة وسهلة جداً تمكنك من إضافة صور جديدة، تغيير الأغنية، تعديل الرسائل، أو إضافة أمنيات جديدة في أي وقت من هاتفك.',
      },
      {
        q: 'كيف أقدم الموقع كهدية لشريكي؟',
        a: 'نرسل لك كرت QR فخم وعالي الجودة يمكنك طباعته ووضعه داخل بوكس الهدية أو إرساله في رسالة مفاجئة، بمجرد أن يمسح الكود بكاميرا الموبايل يفتح الموقع والأغنية مباشرة!',
      },
      {
        q: 'ما هي طرق الدفع المتاحة؟',
        a: 'نوفر جميع طرق الدفع السهلة والمحلية مثل (فودافون كاش، إنستاباي InstaPay، المحافظ الإلكترونية، وبطاقات الدفع البنكية Visa/Mastercard).',
      },
    ],
  },
}

const STORAGE_KEY = 'soulove_landing_config_v5'
const ORDERS_KEY = 'soulove_landing_orders_v5'
const API_BASE = import.meta.env?.VITE_API_BASE_URL || ''

// --- Initial Fetch from Supabase / Postgres Database ---
export async function syncFromSupabase() {
  try {
    const res = await fetch(`${API_BASE}/api/landing`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.config && typeof data.config === 'object') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.config))
    }
    if (Array.isArray(data.orders)) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders))
    }
    return data
  } catch (err) {
    console.log('Sync from server skipped or offline:', err.message)
    return null
  }
}

export function getLandingData() {
  if (typeof localStorage === 'undefined') return defaultLandingData
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return defaultLandingData
    const parsed = JSON.parse(saved)
    return {
      ...defaultLandingData,
      ...parsed,
      pixels: { ...defaultLandingData.pixels, ...(parsed.pixels || {}) },
      demo: { ...defaultLandingData.demo, ...(parsed.demo || {}) },
      hero: { ...defaultLandingData.hero, ...(parsed.hero || {}) },
      featuresSection: { ...defaultLandingData.featuresSection, ...(parsed.featuresSection || {}) },
      stepsSection: { ...defaultLandingData.stepsSection, ...(parsed.stepsSection || {}) },
      pricing: { ...defaultLandingData.pricing, ...(parsed.pricing || {}) },
      reviewsSection: { ...defaultLandingData.reviewsSection, ...(parsed.reviewsSection || {}) },
      faqsSection: { ...defaultLandingData.faqsSection, ...(parsed.faqsSection || {}) },
    }
  } catch {
    return defaultLandingData
  }
}

export async function saveLandingData(data) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save to local storage', err)
    }
  }

  // 🚀 Save to Supabase / PostgreSQL in real time!
  try {
    await fetch(`${API_BASE}/api/landing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    console.log('✅ Landing data saved to Supabase/Postgres successfully')
  } catch (err) {
    console.warn('⚠️ Could not save to remote Supabase server:', err)
  }
}

export function getStoredOrders() {
  if (typeof localStorage === 'undefined') return []
  try {
    const saved = localStorage.getItem(ORDERS_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export async function saveOrder(order) {
  const newOrder = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'جديد', // جديد, قيد التجهيز, تم التسليم
    ...order,
  }

  // Save to local cache first
  if (typeof localStorage !== 'undefined') {
    try {
      const orders = getStoredOrders()
      const updated = [newOrder, ...orders]
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to save order to local storage', err)
    }
  }

  // 🚀 Insert Order into Supabase / PostgreSQL in real time!
  try {
    await fetch(`${API_BASE}/api/landing?action=order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
    console.log('✅ Order placed into Supabase/Postgres successfully:', newOrder.id)
  } catch (err) {
    console.warn('⚠️ Could not save order to remote Supabase server:', err)
  }

  return newOrder
}

export async function updateOrderStatus(orderId, newStatus) {
  if (typeof localStorage !== 'undefined') {
    try {
      const orders = getStoredOrders()
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to update order in local storage', err)
    }
  }

  // 🚀 Update status in Supabase / PostgreSQL
  try {
    await fetch(`${API_BASE}/api/landing?id=${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    console.log('✅ Order status updated in Supabase/Postgres')
  } catch (err) {
    console.warn('⚠️ Could not update order on remote Supabase server:', err)
  }

  return getStoredOrders()
}

export async function deleteOrder(orderId) {
  if (typeof localStorage !== 'undefined') {
    try {
      const orders = getStoredOrders()
      const updated = orders.filter((o) => o.id !== orderId)
      localStorage.setItem(ORDERS_KEY, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to delete order from local storage', err)
    }
  }

  // 🚀 Delete from Supabase / PostgreSQL
  try {
    await fetch(`${API_BASE}/api/landing?id=${orderId}`, {
      method: 'DELETE',
    })
    console.log('✅ Order deleted from Supabase/Postgres')
  } catch (err) {
    console.warn('⚠️ Could not delete order from remote Supabase server:', err)
  }

  return getStoredOrders()
}

// --- SHA-256 Hashing for Meta Conversions API ---
export async function sha256(str) {
  if (!str) return ''
  try {
    const clean = str.trim().toLowerCase()
    const utf8 = new TextEncoder().encode(clean)
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch (err) {
    console.warn('SHA256 error', err)
    return ''
  }
}

// --- Meta Browser Pixel Init ---
export function initMetaPixel(pixelId) {
  if (!pixelId || typeof window === 'undefined') return
  if (window._metaPixelInited) return

  /* eslint-disable */
  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    }
    if (!f._fbq) f._fbq = n
    n.push = n
    n.loaded = !0
    n.version = '2.0'
    n.queue = []
    t = b.createElement(e)
    t.async = !0
    t.src = v
    s = b.getElementsByTagName(e)[0]
    s.parentNode.insertBefore(t, s)
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')
  /* eslint-enable */

  try {
    window.fbq('init', pixelId.trim())
    window.fbq('track', 'PageView')
    window._metaPixelInited = true
  } catch (err) {
    console.warn('Meta Pixel Init error:', err)
  }
}

// --- Meta Browser Pixel Purchase Tracker ---
export function trackPixelPurchase(orderData, price = 399) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq('track', 'Purchase', {
        value: Number(price) || 399,
        currency: 'EGP',
        content_name: orderData?.package || 'باقة الحب المتكاملة VIP 👑',
        content_type: 'product',
        order_id: orderData?.id || Date.now().toString(),
      }, {
        eventID: orderData?.id || Date.now().toString()
      })
      console.log('✅ [Browser Pixel] Purchase Event Tracked with EventID:', orderData?.id)
    } catch (e) {
      console.warn('Pixel Purchase track error:', e)
    }
  }
}

// --- 🔥 Meta Conversions API (CAPI) Direct Server-to-Server Dispatcher ---
export async function sendMetaConversionsApiEvent({
  eventName = 'Purchase',
  orderData = {},
  price = 399,
  pixelConfig = {},
}) {
  const { metaPixelId, metaCapiToken, metaTestEventCode } = pixelConfig
  if (!metaPixelId || !metaCapiToken) {
    console.log('ℹ️ Meta CAPI not dispatched: Pixel ID or CAPI Access Token is empty in dashboard.')
    return { success: false, reason: 'missing_credentials' }
  }

  try {
    const rawPhone = (orderData?.phone || '').replace(/[^0-9]/g, '')
    const formattedPhone = rawPhone.startsWith('0') ? `20${rawPhone.slice(1)}` : rawPhone
    const hashedPhone = formattedPhone ? await sha256(formattedPhone) : ''
    const hashedFirstName = orderData?.yourName ? await sha256(orderData.yourName.split(' ')[0]) : ''

    const eventId = orderData?.id || Date.now().toString()
    const eventTime = Math.floor(Date.now() / 1000)

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: typeof window !== 'undefined' ? window.location.href : 'https://soulove.app',
          action_source: 'website',
          user_data: {
            ph: hashedPhone ? [hashedPhone] : undefined,
            fn: hashedFirstName ? [hashedFirstName] : undefined,
            client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          },
          custom_data: {
            currency: 'EGP',
            value: Number(price) || 399,
            content_name: orderData?.package || 'باقة الحب المتكاملة VIP 👑',
            content_type: 'product',
            order_id: eventId,
          },
        },
      ],
      ...(metaTestEventCode ? { test_event_code: metaTestEventCode.trim() } : {}),
    }

    const endpoint = `https://graph.facebook.com/v19.0/${metaPixelId.trim()}/events?access_token=${metaCapiToken.trim()}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const result = await response.json()
    if (response.ok) {
      console.log('🎉 [Meta CAPI] Conversions API Event Sent Successfully:', result)
      return { success: true, result }
    } else {
      console.warn('⚠️ [Meta CAPI] Error from Meta Graph API:', result)
      return { success: false, error: result }
    }
  } catch (error) {
    console.error('❌ [Meta CAPI] Network / fetch error:', error)
    return { success: false, error: error.message }
  }
}
