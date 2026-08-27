import { musicAsset } from './musicAsset'

export const defaultContent = {
  siteName: '',
  password: '',
  adminPassword: '',
  appearance: {
    primaryColor: '#ef4444',
    backgroundHeartColor: '#be123c',
    heartOpacity: 0.8,
    backgroundHeart: '♥',
    pushHeart: '♥',
  },
  dates: {
    relationshipStart: '',
    firstMeeting: '2025-01-08',
    loveConfession: '2025-03-02',
  },
  music: {
    fileName: 'تامر_عاشور_-_خليني_في_حضنك___بدون_موسيقى__(128k).m4a',
    title: 'اغنيتنا ♥',
    src: JSON.stringify({
      mainSrc: '/api/media?path=soulove%2Fmusic%2Fmusic-1787616306798.m4a',
      tracks: [
        {
          id: 'track-1',
          title: 'اغنيتنا ♥',
          fileName: 'تامر_عاشور_-_خليني_في_حضنك___بدون_موسيقى__(128k).m4a',
          src: '/api/media?path=soulove%2Fmusic%2Fmusic-1787616306798.m4a',
          localUrl: '',
          sizeBytes: 1963391,
        },
      ],
      countdowns: [
        {
          id: 3,
          title: 'فرحنا',
          date: '2027-01-28',
          time: '08:00',
          description: 'كل ثانية بتمر بتقربنا أكتر للمناسبة الحلوة دي 💖',
        },
      ],
      appearanceMode: 'light',
      extraButtons: {
        welcomeNextButton: '',
        storyMemoriesButton: '',
        galleryFinalButton: '',
        countdownsNextButton: '',
      },
    }),
    volume: 0.35,
  },
  login: {
    eyebrow: '♥',
    title: 'روح قلبي 😍',
    subtitle: 'هديه صغنتوته وعسوله زيك كدا يروحي 🥰♥',
    placeholder: 'تاريخ ميلادك يروحي',
    passwordLabel: 'Password',
    button: 'unlock',
    error: 'كلمة المرور غلط، حاولي تاني.',
    footer: '♥',
  },
  welcome: {
    eyebrow: '♥',
    title: 'بنوتي والحته اللى ف قلبي',
    subtitle: 'بحبك يروح قلبي من اول لحظه عيني شافتك فيها وانا دماغي مش بتفكر غير فيكي، مهما الدنيا شغلتني بتفضلي ف قلبي وعقلبي ومش بنساكي، \nالويب سايت دا هديه بسيطه نحتفظ فيه بصورنا واغانينا ولحظتنا الحلوه اتمني يعجبك 🥹♥',
    nextButton: '',
  },
  story: {
    eyebrow: '♥',
    title: 'Our Story',
    firstMeeting: {
      label: 'أول يوم اتقابلنا فيه',
      description: 'اليوم دا عرفت اني مش هكمل المشوار لوحدي، عشان انتي رفيقه حياتي 🥹♥',
    },
    loveConfession: {
      label: 'اليوم الى قولتلك فيه بحبك♥️',
      message: 'لما شوفت الأبتسامه علي وشك قلبي كان بيتنطط جوا صدري 😂♥',
    },
    memoriesButton: '',
  },
  gallery: {
    eyebrow: '♥',
    title: 'Memories',
    finalButton: '',
  },
  final: {
    eyebrow: '♥',
    title: 'For you',
    text: 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.',
  },
  memories: [
    {
      image: '/api/media?path=soulove%2Fmemories%2Fmemories-1787269070700.webp',
      date: '2026-08-11',
      text: '',
    },
    {
      image: '/api/media?path=soulove%2Fmemories%2Fmemories-1787324274952.webp',
      date: '2025-03-19',
      text: 'اكتر صورة بنحبها♥️♥️',
    },
    {
      image: '/api/media?path=soulove%2Fmemories%2Fmemories-1787324274932.webp',
      date: '2025-06-10',
      text: 'خطوبتنا😍♥️',
    },
  ],
  galleryItems: [
    {
      url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224909.webp',
      description: 'اول مره نسافر مع بعض♥️',
    },
    {
      url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224874.webp',
      description: 'خطوبتنا♥️♥️',
    },
    {
      url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224855.webp',
      description: 'صورتنا المفضله♥️♥️',
    },
    {
      url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224869.webp',
      description: '',
    },
    {
      url: '/api/media?path=soulove%2Fgallery%2Fgallery-1787324224859.webp',
      description: '',
    },
  ],
  wishlist: [
    { text: 'نروح البحر ونتمشي علي الرمله بليل 🌊', completed: false },
    { text: 'اشرب قهوه من ايديكي الحلوين 😍', completed: false },
    { text: 'نقعد في مكان هادي ونتكلم براحتنا ♥', completed: false },
  ],
  countdowns: [
    {
      id: 3,
      title: 'فرحنا',
      date: '2027-01-28',
      time: '08:00',
      description: 'كل ثانية بتمر بتقربنا أكتر للمناسبة الحلوة دي 💖',
    },
  ],
  countdownsNextButton: '',
}
