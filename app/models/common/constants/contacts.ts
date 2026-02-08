export const CONTACTS = {
  phone: '+380 66 91 81 991',
  phoneFormatted: '+380 66 91 81 991',
  phoneLink: 'tel:+380669181991',

  schedule: {
    weekdays: 'Пн-Пт: 9:00 - 18:00',
    saturday: 'Сб: 10:00 - 15:00',
    sunday: 'Нд: вихідний',
    full: 'Пн-Пт: 9:00 - 18:00, Сб: 10:00 - 15:00'
  },

  social: {
    telegram: {
      url: 'https://t.me/M1_INSTRYMENT',
      label: '@M1_INSTRYMENT',
      icon: '/icons/icon-telegram.svg'
    },
    viber: {
      url: 'viber://chat?number=%2B380669181991',
      label: '+380 66 91 81 991',
      icon: '/icons/icon-viber.svg'
    },
    tiktok: {
      url: 'https://www.tiktok.com/@m1_instrument?_r=1&_t=ZS-93l18fgXmtB',
      label: '@m1_instrument',
      icon: '/icons/icon-tiktok.svg'
    }
  }
} as const

export const SOCIAL_LINKS = [
  {
    name: 'Telegram',
    ...CONTACTS.social.telegram,
    color: 'bg-sky-50 hover:bg-sky-100 border-sky-200',
    iconBg: 'bg-sky-500'
  },
  {
    name: 'Viber',
    ...CONTACTS.social.viber,
    color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
    iconBg: 'bg-purple-500'
  },
  {
    name: 'TikTok',
    ...CONTACTS.social.tiktok,
    color: 'bg-gray-50 hover:bg-gray-100 border-gray-200',
    iconBg: 'bg-gray-900'
  }
] as const
