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
      fadeOut: 250,
      fadeIn: 400,
      y: 10,
      easeOut: 'ease-in',
      easeIn: 'cubic-bezier(0.22, 1, 0.36, 1)',
    },
    reveal: {
      stagger: 50,
      duration: 350,
      y: 12,
      ease: [0.22, 1, 0.36, 1],
    },
    loveTransition: {
      expandDuration: 1.8,
      revealDuration: 2.0,
      particleCount: 20,
      mobileParticleCount: 12,
    },
    heartExplosion: {
      duration: 1400,
      swapRatio: 0.45,
      heartCount: 26,
      mobileHeartCount: 16,
    },
    text: {
      wordDelay: 100,
    },
  },
  hearts: {
    count: 24,
    mobileRatio: 0.55,
    rgb: '251, 113, 133',
    opacityMin: 0.35,
    opacityMax: 0.75,
  },
}
