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
    eyebrow: 'هدية من قلبي',
    title: 'أهلاً يا حبيبتي',
    subtitle: 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.',
    placeholder: 'كلمة المرور السرية',
    passwordLabel: 'كلمة المرور',
    button: 'افتحي قلبي',
    error: 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.',
    footer: 'صُنع بحب، لكِ وحدك',
  },
  welcome: {
    eyebrow: 'وصلتِ إليه أخيراً',
    title: 'مرحباً يا أجمل حب في حياتي',
    subtitle: 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.',
    nextButton: '',
  },
  story: {
    eyebrow: 'A Love Story',
    title: 'Our Story',
    firstMeeting: {
      label: 'أول يوم التقينا فيه',
      description: 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.',
    },
    loveConfession: {
      label: 'اليوم الذي قلت فيه "أحبك"',
      message: 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.',
    },
    memoriesButton: '',
  },
  gallery: {
    eyebrow: 'Our Album',
    title: 'Memories',
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
