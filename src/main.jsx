import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { applyCachedSiteTheme } from './utils/theme'
import ScrollToTop from './components/ScrollToTop'
import SiteMeta from './components/SiteMeta'
import { ContentProvider } from './context/ContentContext'
import { MusicProvider } from './context/MusicContext'
import './index.css'
import App from './App.jsx'

applyCachedSiteTheme()

// Register Custom Vanilla Service Worker for Visitor PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((reg) => {
        reg.update()
      })
      .catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ContentProvider>
        <MusicProvider>
          <SiteMeta />
          <ScrollToTop />
          <App />
        </MusicProvider>
      </ContentProvider>
    </BrowserRouter>
  </StrictMode>,
)
