import { musicAsset } from './musicAsset'

export const defaultContent = {
  siteName: '',
  password: '',
  adminPassword: '',
  appearance: {
    primaryColor: '#fb7185',
    backgroundHeartColor: '#be123c',
    heartOpacity: 0.65,
    backgroundHeart: '♥',
    pushHeart: '♥',
  },
  dates: {
    relationshipStart: '',
    firstMeeting: '',
    loveConfession: '',
  },
  music: {
    fileName: '',
    title: '',
    src: '',
    volume: 0.35,
  },
  login: {
    eyebrow: '',
    title: '',
    subtitle: '',
    placeholder: '',
    passwordLabel: '',
    button: '',
    error: '',
    footer: '',
  },
  welcome: {
    eyebrow: '',
    title: '',
    subtitle: '',
    nextButton: '',
  },
  story: {
    eyebrow: '',
    title: '',
    firstMeeting: {
      label: '',
      description: '',
    },
    loveConfession: {
      label: '',
      message: '',
    },
    memoriesButton: '',
  },
  gallery: {
    eyebrow: '',
    title: '',
    finalButton: '',
  },
  final: {
    eyebrow: '',
    title: '',
    text: '',
  },
  memories: [],
  galleryItems: [],
  wishlist: [],
  countdowns: [],
  countdownsNextButton: '',
}
