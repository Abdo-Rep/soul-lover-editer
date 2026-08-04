import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { applyCachedSiteTheme } from './utils/theme'
import ScrollToTop from './components/ScrollToTop'
import SiteMeta from './components/SiteMeta'
import { ContentProvider } from './context/ContentContext'
import { MusicProvider } from './context/MusicContext'
import './index.css'
import App from './App.jsx'

// Apply cached theme immediately before render to prevent FOUC
applyCachedSiteTheme()

// Register PWA Service Worker with dynamic, strict routing scopes
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const path = window.location.pathname
    const parts = path.split('/').filter(Boolean)
    let swScope = '/'

    if (parts[0] === 'soulove-admin') {
      swScope = '/soulove-admin/'
    } else if (parts.length >= 2 && (parts[1] === 'dashboard' || parts[1] === 'login')) {
      const slug = parts[0]
      swScope = `/${slug}/dashboard/`
    } else if (parts.length >= 1) {
      const slug = parts[0]
      swScope = `/${slug}/`
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations()
      for (const reg of registrations) {
        const regScopePath = new URL(reg.scope).pathname
        // Clean up conflicting non-matching scopes (especially the old root '/' scope)
        if (regScopePath !== swScope) {
          await reg.unregister()
        }
      }
      // Register with the strict scope matching the manifest
      await navigator.serviceWorker.register('/sw.js', { scope: swScope })
    } catch (err) {
      console.log('PWA Service Worker Registration Failed:', err)
    }
  })
}

// ─── Root Error Boundary ──────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err, info) {
    console.error('[Soulove] Uncaught error:', err, info)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            direction: 'rtl',
            background: '#fff1f2',
            color: '#be123c',
            fontFamily: 'Cairo, sans-serif',
          }}
        >
          <p style={{ fontSize: '3rem' }}>💔</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '0.5rem' }}>
            حدث خطأ غير متوقع
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#fb7185', marginTop: '0.5rem' }}>
            جرّب إعادة تحميل الصفحة
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1.5rem',
              padding: '0.625rem 1.5rem',
              borderRadius: '1.5rem',
              background: '#fb7185',
              color: '#fff',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            إعادة التحميل
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
// ─────────────────────────────────────────────────────────────────────────────

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <ContentProvider>
          <MusicProvider>
            <SiteMeta />
            <ScrollToTop />
            <App />
          </MusicProvider>
        </ContentProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
