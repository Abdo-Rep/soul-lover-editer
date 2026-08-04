export const config = {
  music: {
    storageKey: 'romantic-site-music-playing',
    pendingStartKey: 'romantic-site-music-pending',
  },
  auth: {
    storageKey: 'romantic-site-authenticated',
    adminStorageKey: 'romantic-site-admin',
    skipIntroKey: 'romantic-site-skip-intro',
  },
  animations: {
    screen: {
      fadeOut: 400,
      fadeIn: 720,
      y: 12,
      easeOut: 'ease-in',
      easeIn: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    reveal: {
      stagger: 80,
      duration: 500,
      y: 16,
      ease: [0.22, 1, 0.36, 1],
    },
    loveTransition: {
      expandDuration: 2.8,
      revealDuration: 3,
      particleCount: 36,
      mobileParticleCount: 20,
    },
    heartExplosion: {
      duration: 2200,
      swapRatio: 0.45,
      heartCount: 52,
      mobileHeartCount: 36,
    },
    text: {
      wordDelay: 140,
    },
  },
  hearts: {
    count: 58,
    mobileRatio: 0.7,
    rgb: '251, 113, 133',
    opacityMin: 0.38,
    opacityMax: 0.82,
  },
}
