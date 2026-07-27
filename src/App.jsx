import { Route, Routes } from 'react-router-dom'
import Home from './components/Home'
import RomanticBackdrop from './components/RomanticBackdrop'
import Dashboard from './pages/Dashboard'
import SuperAdmin from './pages/SuperAdmin'

export default function App() {
  return (
    <RomanticBackdrop>
      <Routes>
        {/* Super Admin Control Panel at / */}
        <Route path="/" element={<SuperAdmin />} />

        {/* Client Dashboard */}
        <Route path="/:clientSlug/dashboard" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Client Visitor Gift Site at /:clientSlug */}
        <Route path="/:clientSlug" element={<Home />} />

        {/* Fallback */}
        <Route path="*" element={<Home />} />
      </Routes>
    </RomanticBackdrop>
  )
}
