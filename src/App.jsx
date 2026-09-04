import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import RomanticBackdrop from './components/RomanticBackdrop'
import Dashboard from './pages/Dashboard'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import PwaNotification from './components/PwaNotification'

export default function App() {
  return (
    <>
      <PwaNotification />
      <Routes>
      {/* 🚫 1. Root path / renders NotFound page */}
      <Route
        path="/"
        element={
          <RomanticBackdrop>
            <NotFound />
          </RomanticBackdrop>
        }
      />

      {/* 🔒 2. Secret Super Admin Control Panel */}
      <Route
        path="/soulove-admin"
        element={
          <RomanticBackdrop>
            <SuperAdmin />
          </RomanticBackdrop>
        }
      />

      {/* 📱 3. Client Dashboard / Login */}
      <Route
        path="/:clientSlug/login"
        element={
          <RomanticBackdrop>
            <Dashboard />
          </RomanticBackdrop>
        }
      />
      <Route
        path="/:clientSlug/dashboard"
        element={
          <RomanticBackdrop>
            <Dashboard />
          </RomanticBackdrop>
        }
      />

      {/* 💖 4. Dynamic Client Site at /:clientSlug */}
      <Route
        path="/:clientSlug"
        element={
          <RomanticBackdrop>
            <Home />
          </RomanticBackdrop>
        }
      />

      {/* ⚠️ 5. 404 Fallback Error Page for Invalid Paths */}
      <Route
        path="*"
        element={
          <RomanticBackdrop>
            <NotFound />
          </RomanticBackdrop>
        }
      />
    </Routes>
    </>
  )
}
