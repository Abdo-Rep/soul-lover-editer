import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import RomanticBackdrop from './components/RomanticBackdrop'
import Dashboard from './pages/Dashboard'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import RootLanding from './pages/RootLanding'

export default function App() {
  return (
    <Routes>
      {/* 🚀 1. Dedicated Standalone Landing Page & Admin Routes (EG / Arabic) */}
      <Route path="/" element={<RootLanding />} />
      <Route path="/landing" element={<RootLanding />} />
      <Route path="/landing/admin" element={<RootLanding defaultRoute="admin" />} />
      <Route path="/landing-admin" element={<RootLanding defaultRoute="admin" />} />
      <Route path="/landing-page" element={<RootLanding />} />
      <Route path="/order-success" element={<RootLanding />} />
      <Route path="/thank-you" element={<RootLanding />} />

      {/* 🇺🇸 2. Dedicated Standalone US English Landing Page & Admin Routes */}
      <Route path="/landing/us" element={<RootLanding market="us" />} />
      <Route path="/landing/us/admin" element={<RootLanding market="us" defaultRoute="admin" />} />
      <Route path="/landing/us/order-success" element={<RootLanding market="us" defaultRoute="success" />} />
      <Route path="/landing/us/thank-you" element={<RootLanding market="us" defaultRoute="success" />} />
      <Route path="/us" element={<RootLanding market="us" />} />
      <Route path="/us/admin" element={<RootLanding market="us" defaultRoute="admin" />} />
      <Route path="/us-admin" element={<RootLanding market="us" defaultRoute="admin" />} />
      <Route path="/us/order-success" element={<RootLanding market="us" defaultRoute="success" />} />
      <Route path="/us/thank-you" element={<RootLanding market="us" defaultRoute="success" />} />
      <Route path="/en" element={<RootLanding market="us" />} />

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
  )
}
