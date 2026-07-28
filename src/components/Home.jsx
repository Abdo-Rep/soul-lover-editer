import { startTransition, useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { config } from '../data/config'
import { useAuth } from '../hooks/useAuth'
import { useMusic } from '../context/MusicContext'
import { getScreenMotion } from '../utils/motion'
import { useContent } from '../context/ContentContext'
import Enter from '../pages/Enter'
import Final from '../pages/Final'
import Gallery from '../pages/Gallery'
import NotFound from '../pages/NotFound'
import Story from '../pages/Story'
import Welcome from '../pages/Welcome'
import HeartExplosionTransition from './HeartExplosionTransition'
import LoveTransition from './LoveTransition'
import RomanticShell from './RomanticShell'
import Wishlist from './Wishlist'

const STEPS = ['enter', 'welcome', 'story', 'final']
const { skipIntroKey } = config.auth
const screenMotion = getScreenMotion()

const PREVIOUS_STEP = {
  story: 'welcome',
  final: 'story',
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function shouldSkipLoginIntro() {
  return sessionStorage.getItem(skipIntroKey) === 'true'
}

export default function Home() {
  const { siteNotFound, isLoading } = useContent()
  const { isAuthenticated, login } = useAuth()
  const { requestMusicStart, playMusic } = useMusic()
  const [step, setStep] = useState(() => (isAuthenticated ? 'welcome' : 'enter'))
  const [loginOverlay, setLoginOverlay] = useState(false)
  const [welcomeFadeDone, setWelcomeFadeDone] = useState(false)
  const [explosionTarget, setExplosionTarget] = useState(null)
  const [pageFadeTick, setPageFadeTick] = useState(0)
  const [showWishlist, setShowWishlist] = useState(false)
  const [showGallery, setShowGallery] = useState(false)
  const pendingStepRef = useRef(null)

  const showMusic =
    isAuthenticated &&
    (step !== 'enter' || loginOverlay)

  const pageFadeClass = 'screen-fade-in'

  if (siteNotFound && !isLoading) {
    return <NotFound />
  }

  return (
    <RomanticShell
      showMusic={showMusic}
      showBack={(showWishlist || showGallery) ? false : canGoBack}
      onBack={handleBack}
      showWishlistToggle={isAuthenticated && (step !== 'enter' || loginOverlay)}
      onWishlistToggle={handleWishlistToggle}
      isWishlistOpen={showWishlist}
      showGalleryToggle={isAuthenticated && (step !== 'enter' || loginOverlay)}
      onGalleryToggle={handleGalleryToggle}
      isGalleryOpen={showGallery}
      showHome={showHome}
      onHomeClick={handleHomeClick}
    >
      <AnimatePresence mode="wait">
        {showWishlist ? (
          <motion.div
            key="wishlist-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full flex-1 flex flex-col justify-start"
          >
            <Wishlist />
          </motion.div>
        ) : showGallery ? (
          <motion.div
            key="gallery-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="w-full flex-1 flex flex-col justify-start"
          >
            <Gallery onNext={() => setShowGallery(false)} showNext={false} />
          </motion.div>
        ) : (
          <motion.div
            key={`${step}-${pageFadeTick}`}
            className={`flow-screen ${pageFadeClass}`.trim()}
            style={{
              '--screen-y': `${screenMotion.y}px`,
              '--screen-fade-in': `${screenMotion.fadeIn}ms`,
            }}
          >
            {renderStep(step)}
          </motion.div>
        )}
      </AnimatePresence>

      {loginOverlay ? (
        <LoveTransition
          onCovered={handleLoveCovered}
          onComplete={handleLoveComplete}
          canExit={welcomeFadeDone}
        />
      ) : null}

      {explosionTarget ? (
        <HeartExplosionTransition
          onSwap={handleExplosionSwap}
          onComplete={handleExplosionComplete}
        />
      ) : null}
    </RomanticShell>
  )
}
