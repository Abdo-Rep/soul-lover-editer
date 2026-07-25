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

// Register Custom Vanilla Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('ServiceWorker registration failed:', err)
    })
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
