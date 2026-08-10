import React from 'react'
import LandingApp from '../../landing-page/src/App.jsx'

export default function RootLanding({ defaultRoute }) {
  return (
    <div className="w-full min-h-screen">
      <LandingApp initialRoute={defaultRoute} />
    </div>
  )
}
