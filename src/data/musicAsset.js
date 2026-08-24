const musicModules = import.meta.glob('../assets/music/*.{mp3,ogg,wav,m4a,aac,flac,webm,opus}', {
  eager: true,
  import: 'default',
})

const preferredKey = Object.keys(musicModules).find((path) =>
  path.includes('romantic'),
)

export const musicAsset = preferredKey
  ? musicModules[preferredKey]
  : Object.values(musicModules)[0] ?? ''
