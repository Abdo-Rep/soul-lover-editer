import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import RomanticBackdrop from './components/RomanticBackdrop'
import Dashboard from './pages/Dashboard'
import SuperAdmin from './pages/SuperAdmin'

export default function App() {
  return (
    <RomanticBackdrop>
      <Routes>
        {/* Dedicated Super Admin Control Panel */}
        <Route path="/soulove-admin" element={<SuperAdmin />} />

        {/* Client Dashboard */}
        <Route path="/:clientSlug/dashboard" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Root Visitor Page & Dynamic Client Site at /:clientSlug */}
        <Route path="/" element={<Home />} />
        <Route path="/:clientSlug" element={<Home />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </RomanticBackdrop>
  )
}
