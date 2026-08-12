// Default editable data for the US English landing page
export const defaultLandingDataUs = {
  // Pixel & Conversions API Settings (Inherits or can have custom ID)
  pixels: {
    metaPixelId: '', // e.g. 123456789012345
    metaCapiToken: '', // Meta Conversions API Access Token from Events Manager
    metaTestEventCode: '',
    tiktokPixelId: '',
  },

  // Demo Settings
  demo: {
    url: 'https://soul-lover-gules.vercel.app/ssss',
    password: 'love',
    hintText: '🔑 Password to test the live romantic preview below:',
  },

  // Hero Section
  hero: {
    badge: 'The Most Romantic & Creative Gift of 2026 🎁',
    titleLine1: 'Make Your Love Story',
    titleLine2: 'Live Forever Online 💖',
    subtitle: 'A private, password-protected custom website celebrating your favorite photos, special songs, audio messages, live anniversary countdowns, and an interactive couples bucket list with a printable luxury QR keepsake card.',
    trustBadge: 'Loved by 2,500+ Happy Couples Worldwide ⭐⭐⭐⭐⭐',
  },

  // Features Section (6 Luxury Cards)
  featuresSection: {
    badge: 'Everything For an Unforgettable Gift 🔥',
    title: 'Exclusive Features Designed to Touch Their Heart',
    subtitle: 'Every detail is thoughtfully crafted to give your partner goosebumps and create a lasting memory from the moment they scan the QR code.',
    items: [
      {
        icon: 'Lock',
        title: '🔒 100% Private & Password Protected',
        desc: 'Your private digital sanctuary is locked with a custom secret code only you and your partner can access.',
      },
      {
        icon: 'Music',
        title: '🎵 3D Music & Voice Note Player',
        desc: 'Play your favorite love song in the background and record an intimate personal audio message in your own voice.',
      },
      {
        icon: 'Calendar',
        title: '⏳ Live Milestone & Date Countdowns',
        desc: 'Real-time counters tracking days, hours, and seconds since the day you met, your first kiss, or counting down to your wedding.',
      },
      {
        icon: 'Heart',
        title: '📸 Animated Love Story & HD Gallery',
        desc: 'An interactive chronological journey of your relationship with full-screen photo popups and sweet romantic captions.',
      },
      {
        icon: 'Sparkles',
        title: '✨ Interactive Couples Bucket List',
        desc: 'Write your future travel goals and dreams together, then check them off with romantic checkmarks as you live them.',
      },
      {
        icon: 'QrCode',
        title: '📱 Printable Luxury QR Keepsake Card',
        desc: 'A gorgeous, high-resolution QR card ready to print for gift boxes or send digitally for an instant surprise.',
      },
    ],
  },

  // Steps Section (How it works in 3 steps)
  stepsSection: {
    badge: 'Fast & Effortless ⚡',
    title: 'How It Works in 3 Simple Steps',
    subtitle: 'No technical skills required. We build and deliver your personalized website ready to surprise your partner in under 30 minutes.',
    items: [
      {
        num: '01',
        title: 'Enter Your Names & Date',
        desc: 'Provide your name, your partner’s name, and your anniversary or the special date you first met.',
      },
      {
        num: '02',
        title: 'Choose Photos & Songs',
        desc: 'Upload your favorite pictures, your couple song, and an optional dedicated voice message.',
      },
      {
        num: '03',
        title: 'Receive Your Website & QR Card',
        desc: 'Your custom website link and high-res QR card are delivered directly to your email and phone ready to gift!',
      },
    ],
  },

  // Single VIP Pricing Card
  pricing: {
    badge: 'Special Limited-Time Offer 🔥',
    packageName: 'The Complete VIP Love Sanctuary 👑',
    subtitle: 'Includes all luxury features with lifetime access — zero monthly fees',
    price: '19.99',
    oldPrice: '49.99',
    currencySymbol: '$',
    discountText: 'Special 60% OFF Today Only ⏳',
    features: [
      'Private lifetime custom website URL with your names (Forever Access)',
      'Password protection for complete intimacy & security 🔒',
      'Integrated background music player for your special song 🎵',
      'Personal voice note message player with live sound visualizer 🎙️',
      'Full HD photo gallery & animated love story timeline 📸',
      'Live dynamic countdown timers (Days & Seconds) for all dates ⏳',
      'Interactive couples bucket list with checkable goals ✅',
      'High-res printable luxury QR gift card ready for gift boxes 🎁',
      'Private dashboard to edit photos, songs, and notes anytime',
      'Instant delivery to your email and phone in under 30 minutes ⚡',
      '100% Love-It Guarantee or your money back',
    ],
    buttonText: 'Claim Your Custom Website ($19.99) 🚀',
  },

  // Reviews Section
  reviewsSection: {
    badge: 'Real Couples ⭐',
    title: 'Loved by Over 2,500+ Couples in the US',
    subtitle: 'Real stories from partners who gave the most meaningful, emotional gift.',
    items: [
      {
        name: 'Sarah & Michael',
        location: 'New York, NY',
        rating: 5,
        date: '2 days ago',
        comment: 'Literally the best anniversary gift I have ever given my husband! When he scanned the QR code in his gift box and our song started playing with all our photos, he actually teared up. The quality is unreal!',
      },
      {
        name: 'Emily & David',
        location: 'Los Angeles, CA',
        rating: 5,
        date: '1 week ago',
        comment: 'The countdown timers and the interactive bucket list are so fun! We love checking off places we travel to together. Plus it took less than 20 minutes to receive the finished site.',
      },
      {
        name: 'Jessica & James',
        location: 'Austin, TX',
        rating: 5,
        date: '3 weeks ago',
        comment: 'Such a unique, modern take on a romantic keepsake. The audio player and voice note feature made it feel so intimate and special. 10/10 recommend!',
      },
    ],
  },

  // FAQ Section
  faqsSection: {
    badge: 'Instant Answers 💡',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about ordering, delivery, and gifting.',
    items: [
      {
        q: 'How fast will I receive our custom website?',
        a: 'Your personalized website and printable QR gift card are built and delivered to your email and phone in under 15 to 30 minutes after placing your order!',
      },
      {
        q: 'Is our website private and secure?',
        a: 'Yes, 100%! Your website is protected by a private passcode chosen by you. No one can view your photos, songs, or messages without the code.',
      },
      {
        q: 'Can I add or update photos and songs later?',
        a: 'Absolutely! You get lifetime access to your own private control panel where you can upload new photos, edit stories, change songs, or add bucket list items anytime from your phone.',
      },
      {
        q: 'How do I present this as a gift to my partner?',
        a: 'We send you a high-resolution printable QR gift card. You can print it out to put inside a gift box, greeting card, or simply send the link/QR code digitally for a romantic surprise!',
      },
      {
        q: 'Are there any recurring or monthly subscriptions?',
        a: 'No subscriptions ever! It is a single one-time payment for lifetime access and unlimited updates.',
      },
    ],
  },
}

const STORAGE_KEY_US = 'soulove_landing_config_us_v1'
const ORDERS_KEY_US = 'soulove_landing_orders_us_v1'
const API_BASE = import.meta.env?.VITE_API_BASE_URL || ''

// --- Initial Fetch from Supabase / Postgres Database (US Edition) ---
export async function syncFromSupabaseUs() {
  try {
    const res = await fetch(`${API_BASE}/api/landing?market=us`)
    if (!res.ok) return null
    const data = await res.json()
    if (data.config && typeof data.config === 'object') {
      localStorage.setItem(STORAGE_KEY_US, JSON.stringify(data.config))
    }
    if (Array.isArray(data.orders)) {
      const usOrders = data.orders.filter((o) => o.market === 'us')
      localStorage.setItem(ORDERS_KEY_US, JSON.stringify(usOrders))
    }
    return data
  } catch (err) {
    console.log('Sync US from server skipped or offline:', err.message)
    return null
  }
}

export function getLandingDataUs() {
  if (typeof localStorage === 'undefined') return defaultLandingDataUs
  try {
    const saved = localStorage.getItem(STORAGE_KEY_US)
    if (!saved) return defaultLandingDataUs
    const parsed = JSON.parse(saved)
    return {
      ...defaultLandingDataUs,
      ...parsed,
      pixels: { ...defaultLandingDataUs.pixels, ...(parsed.pixels || {}) },
      demo: { ...defaultLandingDataUs.demo, ...(parsed.demo || {}) },
      hero: { ...defaultLandingDataUs.hero, ...(parsed.hero || {}) },
      featuresSection: { ...defaultLandingDataUs.featuresSection, ...(parsed.featuresSection || {}) },
      stepsSection: { ...defaultLandingDataUs.stepsSection, ...(parsed.stepsSection || {}) },
      pricing: { ...defaultLandingDataUs.pricing, ...(parsed.pricing || {}) },
      reviewsSection: { ...defaultLandingDataUs.reviewsSection, ...(parsed.reviewsSection || {}) },
      faqsSection: { ...defaultLandingDataUs.faqsSection, ...(parsed.faqsSection || {}) },
      webhook: { ...defaultLandingDataUs.webhook, ...(parsed.webhook || {}) },
    }
  } catch {
    return defaultLandingDataUs
  }
}

export async function saveLandingDataUs(data) {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY_US, JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save US to local storage', err)
    }
  }

  // 🚀 Save to Supabase / PostgreSQL in real time under id = 'us'!
  try {
    await fetch(`${API_BASE}/api/landing?market=us`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, market: 'us' }),
    })
    console.log('✅ US Landing data saved to Supabase successfully')
  } catch (err) {
    console.warn('⚠️ Could not save US landing to remote Supabase:', err)
  }
}

export function getStoredOrdersUs() {
  if (typeof localStorage === 'undefined') return []
  try {
    const saved = localStorage.getItem(ORDERS_KEY_US)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export async function saveOrderUs(order) {
  const newOrder = {
    id: 'US_' + Date.now().toString(),
    createdAt: new Date().toISOString(),
    status: 'New',
    market: 'us',
    currency: 'USD',
    ...order,
  }

  // Save to local cache first
  if (typeof localStorage !== 'undefined') {
    try {
      const orders = getStoredOrdersUs()
      const updated = [newOrder, ...orders]
      localStorage.setItem(ORDERS_KEY_US, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to save US order to local storage', err)
    }
  }

  // 🚀 Insert Order into Supabase / PostgreSQL in real time!
  try {
    await fetch(`${API_BASE}/api/landing?action=order&market=us`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    })
    console.log('✅ US Order placed into Supabase successfully:', newOrder.id)
  } catch (err) {
    console.warn('⚠️ Could not save US order to remote Supabase server:', err)
  }

  return newOrder
}

export async function updateOrderStatusUs(orderId, newStatus) {
  if (typeof localStorage !== 'undefined') {
    try {
      const orders = getStoredOrdersUs()
      const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      localStorage.setItem(ORDERS_KEY_US, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to update US order in local storage', err)
    }
  }

  try {
    await fetch(`${API_BASE}/api/landing?id=${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
  } catch (err) {
    console.warn('⚠️ Could not update US order status on remote server:', err)
  }

  return getStoredOrdersUs()
}

export async function deleteOrderUs(orderId) {
  if (typeof localStorage !== 'undefined') {
    try {
      const orders = getStoredOrdersUs()
      const updated = orders.filter((o) => o.id !== orderId)
      localStorage.setItem(ORDERS_KEY_US, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to delete US order from local storage', err)
    }
  }

  try {
    await fetch(`${API_BASE}/api/landing?id=${orderId}`, {
      method: 'DELETE',
    })
  } catch (err) {
    console.warn('⚠️ Could not delete US order from remote server:', err)
  }

  return getStoredOrdersUs()
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

// --- Meta Browser Pixel Init (Supports Shared or Custom Pixel ID) ---
export function initMetaPixelUs(pixelId) {
  if (!pixelId || typeof window === 'undefined') return
  if (window._metaPixelInitedUs) return

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
    window._metaPixelInitedUs = true
  } catch (err) {
    console.warn('Meta Pixel US Init error:', err)
  }
}

// --- Meta Browser Pixel Purchase Tracker in USD ($) ---
export function trackPixelPurchaseUs(orderData, price = 19.99) {
  if (typeof window !== 'undefined' && window.fbq) {
    try {
      window.fbq(
        'track',
        'Purchase',
        {
          value: Number(price) || 19.99,
          currency: 'USD',
          content_name: orderData?.package || 'The Complete VIP Love Sanctuary 👑',
          content_type: 'product',
          order_id: orderData?.id || Date.now().toString(),
        },
        {
          eventID: orderData?.id || Date.now().toString(),
        }
      )
      console.log('✅ [US Browser Pixel] Purchase Tracked in USD ($) with EventID:', orderData?.id)
    } catch (e) {
      console.warn('Pixel Purchase US track error:', e)
    }
  }
}

// --- Meta Conversions API (CAPI) Direct Server Dispatcher in USD ($) ---
export async function sendMetaConversionsApiEventUs({
  eventName = 'Purchase',
  orderData = {},
  price = 19.99,
  pixelConfig = {},
}) {
  const { metaPixelId, metaCapiToken, metaTestEventCode } = pixelConfig
  if (!metaPixelId || !metaCapiToken) {
    return { success: false, reason: 'missing_credentials' }
  }

  try {
    const rawPhone = (orderData?.phone || '').replace(/[^0-9]/g, '')
    const formattedPhone = rawPhone.startsWith('1') ? rawPhone : `1${rawPhone}`
    const hashedPhone = formattedPhone ? await sha256(formattedPhone) : ''
    const hashedEmail = orderData?.email ? await sha256(orderData.email) : ''
    const hashedFirstName = orderData?.yourName ? await sha256(orderData.yourName.split(' ')[0]) : ''

    const eventId = orderData?.id || Date.now().toString()
    const eventTime = Math.floor(Date.now() / 1000)

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: eventTime,
          event_id: eventId,
          event_source_url: typeof window !== 'undefined' ? window.location.href : 'https://soulove.app/us',
          action_source: 'website',
          user_data: {
            em: hashedEmail ? [hashedEmail] : undefined,
            ph: hashedPhone ? [hashedPhone] : undefined,
            fn: hashedFirstName ? [hashedFirstName] : undefined,
            client_user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
          },
          custom_data: {
            currency: 'USD',
            value: Number(price) || 19.99,
            content_name: orderData?.package || 'The Complete VIP Love Sanctuary 👑',
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
      console.log('🎉 [US Meta CAPI] Event Sent in USD ($):', result)
      return { success: true, result }
    } else {
      console.warn('⚠️ [US Meta CAPI] Error:', result)
      return { success: false, error: result }
    }
  } catch (error) {
    console.error('❌ [US Meta CAPI] Fetch error:', error)
    return { success: false, error: error.message }
  }
}
