import React from 'react'
import LandingApp from '../../landing-page/src/App.jsx'
import UsLandingApp from '../../landing-page/src/us/UsApp.jsx'

export default function RootLanding({ defaultRoute, market = 'eg' }) {
  if (market === 'us') {
    return (
      <div className="soulove-landing-wrapper soulove-us-market w-full min-h-screen">
        <UsLandingApp initialRoute={defaultRoute} />
      </div>
    )
  }

  return (
    <div className="soulove-landing-wrapper w-full min-h-screen">
      <LandingApp initialRoute={defaultRoute} />
    </div>
  )
}
