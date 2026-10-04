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

// Register Service Worker for PWA in production only (avoids Vite dev HMR/bundler connection resets)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[PWA] Service Worker registration failed:', err)
      })
    })
  } else {
    // In dev mode, unregister any active workers to prevent connection resets
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister()
      }
    }).catch(() => {})
  }
}

import NotFound from './pages/NotFound'

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
      return <NotFound />
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
