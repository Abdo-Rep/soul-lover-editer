import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import RomanticBackdrop from './components/RomanticBackdrop'
import Dashboard from './pages/Dashboard'
import SuperAdmin from './pages/SuperAdmin'
import NotFound from './pages/NotFound'
import RootLanding from './pages/RootLanding'

export default function App() {
  return (
    <RomanticBackdrop>
      <Routes>
        {/* Secret Super Admin Control Panel */}
        <Route path="/soulove-admin" element={<SuperAdmin />} />

        {/* Client Dashboard / Login */}
        <Route path="/:clientSlug/login" element={<Dashboard />} />
        <Route path="/:clientSlug/dashboard" element={<Dashboard />} />

        {/* Root Visitor Page & Dynamic Client Site at /:clientSlug */}
        <Route path="/" element={<RootLanding />} />
        <Route path="/:clientSlug" element={<Home />} />

        {/* 404 Fallback Error Page for Invalid Paths */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </RomanticBackdrop>
  )
}
