import originalDayJS from 'dayjs';

const localizedFormat = require('dayjs/plugin/localizedFormat');
const utc = require('dayjs/plugin/utc');
const pluralGetSet = require('dayjs/plugin/pluralGetSet');
const timezone = require('dayjs/plugin/timezone');
const localeData = require('dayjs/plugin/localeData');

const dayjs = originalDayJS;
dayjs.extend(localizedFormat); // gives the 'L' formatting ability for .format
dayjs.extend(utc); // gives .utc() and .local()
dayjs.extend(pluralGetSet); // gives .hour .minute get/set ability
dayjs.extend(timezone); // timezone support
dayjs.extend(localeData); // gives local specific data

/* eslint-disable global-require */
const locales = {
  af: () => require('dayjs/locale/af'),
  am: () => require('dayjs/locale/am'),
  'ar-dz': () => require('dayjs/locale/ar-dz'),
  'ar-kw': () => require('dayjs/locale/ar-kw'),
  'ar-ly': () => require('dayjs/locale/ar-ly'),
  'ar-ma': () => require('dayjs/locale/ar-ma'),
  'ar-sa': () => require('dayjs/locale/ar-sa'),
  'ar-tn': () => require('dayjs/locale/ar-tn'),
  ar: () => require('dayjs/locale/ar'),
  az: () => require('dayjs/locale/az'),
  be: () => require('dayjs/locale/be'),
  bg: () => require('dayjs/locale/bg'),
  bi: () => require('dayjs/locale/bi'),
  bm: () => require('dayjs/locale/bm'),
  bn: () => require('dayjs/locale/bn'),
  bo: () => require('dayjs/locale/bo'),
  br: () => require('dayjs/locale/br'),
  bs: () => require('dayjs/locale/bs'),
  ca: () => require('dayjs/locale/ca'),
  cs: () => require('dayjs/locale/cs'),
  cv: () => require('dayjs/locale/cv'),
  cy: () => require('dayjs/locale/cy'),
  da: () => require('dayjs/locale/da'),
  'de-at': () => require('dayjs/locale/de-at'),
  'de-ch': () => require('dayjs/locale/de-ch'),
  de: () => require('dayjs/locale/de'),
  dv: () => require('dayjs/locale/dv'),
  el: () => require('dayjs/locale/el'),
  'en-au': () => require('dayjs/locale/en-au'),
  'en-ca': () => require('dayjs/locale/en-ca'),
  'en-gb': () => require('dayjs/locale/en-gb'),
  'en-ie': () => require('dayjs/locale/en-ie'),
  'en-il': () => require('dayjs/locale/en-il'),
  'en-in': () => require('dayjs/locale/en-in'),
  'en-nz': () => require('dayjs/locale/en-nz'),
  'en-sg': () => require('dayjs/locale/en-sg'),
  'en-tt': () => require('dayjs/locale/en-tt'),
  en: () => require('dayjs/locale/en'),
  eo: () => require('dayjs/locale/eo'),
  'es-do': () => require('dayjs/locale/es-do'),
  'es-pr': () => require('dayjs/locale/es-pr'),
  'es-us': () => require('dayjs/locale/es-us'),
  es: () => require('dayjs/locale/es'),
  et: () => require('dayjs/locale/et'),
  eu: () => require('dayjs/locale/eu'),
  fa: () => require('dayjs/locale/fa'),
  fi: () => require('dayjs/locale/fi'),
  fo: () => require('dayjs/locale/fo'),
  'fr-ca': () => require('dayjs/locale/fr-ca'),
  'fr-ch': () => require('dayjs/locale/fr-ch'),
  fr: () => require('dayjs/locale/fr'),
  fy: () => require('dayjs/locale/fy'),
  ga: () => require('dayjs/locale/ga'),
  gd: () => require('dayjs/locale/gd'),
  gl: () => require('dayjs/locale/gl'),
  'gom-latn': () => require('dayjs/locale/gom-latn'),
  gu: () => require('dayjs/locale/gu'),
  he: () => require('dayjs/locale/he'),
  hi: () => require('dayjs/locale/hi'),
  hr: () => require('dayjs/locale/hr'),
  ht: () => require('dayjs/locale/ht'),
  hu: () => require('dayjs/locale/hu'),
  'hy-am': () => require('dayjs/locale/hy-am'),
  id: () => require('dayjs/locale/id'),
  is: () => require('dayjs/locale/is'),
  'it-ch': () => require('dayjs/locale/it-ch'),
  it: () => require('dayjs/locale/it'),
  ja: () => require('dayjs/locale/ja'),
  jv: () => require('dayjs/locale/jv'),
  ka: () => require('dayjs/locale/ka'),
  kk: () => require('dayjs/locale/kk'),
  km: () => require('dayjs/locale/km'),
  kn: () => require('dayjs/locale/kn'),
  ko: () => require('dayjs/locale/ko'),
  ku: () => require('dayjs/locale/ku'),
  ky: () => require('dayjs/locale/ky'),
  lb: () => require('dayjs/locale/lb'),
  lo: () => require('dayjs/locale/lo'),
  lt: () => require('dayjs/locale/lt'),
  lv: () => require('dayjs/locale/lv'),
  me: () => require('dayjs/locale/me'),
  mi: () => require('dayjs/locale/mi'),
  mk: () => require('dayjs/locale/mk'),
  ml: () => require('dayjs/locale/ml'),
  mn: () => require('dayjs/locale/mn'),
  mr: () => require('dayjs/locale/mr'),
  'ms-my': () => require('dayjs/locale/ms-my'),
  ms: () => require('dayjs/locale/ms'),
  mt: () => require('dayjs/locale/mt'),
  my: () => require('dayjs/locale/my'),
  nb: () => require('dayjs/locale/nb'),
  ne: () => require('dayjs/locale/ne'),
  'nl-be': () => require('dayjs/locale/nl-be'),
  nl: () => require('dayjs/locale/nl'),
  nn: () => require('dayjs/locale/nn'),
  'oc-lnc': () => require('dayjs/locale/oc-lnc'),
  'pa-in': () => require('dayjs/locale/pa-in'),
  pl: () => require('dayjs/locale/pl'),
  'pt-br': () => require('dayjs/locale/pt-br'),
  pt: () => require('dayjs/locale/pt'),
  ro: () => require('dayjs/locale/ro'),
  ru: () => require('dayjs/locale/ru'),
  rw: () => require('dayjs/locale/rw'),
  sd: () => require('dayjs/locale/sd'),
  se: () => require('dayjs/locale/se'),
  si: () => require('dayjs/locale/si'),
  sk: () => require('dayjs/locale/sk'),
  sl: () => require('dayjs/locale/sl'),
  sq: () => require('dayjs/locale/sq'),
  'sr-cyrl': () => require('dayjs/locale/sr-cyrl'),
  sr: () => require('dayjs/locale/sr'),
  ss: () => require('dayjs/locale/ss'),
  sv: () => require('dayjs/locale/sv'),
  sw: () => require('dayjs/locale/sw'),
  ta: () => require('dayjs/locale/ta'),
  te: () => require('dayjs/locale/te'),
  tet: () => require('dayjs/locale/tet'),
  tg: () => require('dayjs/locale/tg'),
  th: () => require('dayjs/locale/th'),
  tk: () => require('dayjs/locale/tk'),
  'tl-ph': () => require('dayjs/locale/tl-ph'),
  tlh: () => require('dayjs/locale/tlh'),
  tr: () => require('dayjs/locale/tr'),
  tzl: () => require('dayjs/locale/tzl'),
  'tzm-latn': () => require('dayjs/locale/tzm-latn'),
  tzm: () => require('dayjs/locale/tzm'),
  'ug-cn': () => require('dayjs/locale/ug-cn'),
  uk: () => require('dayjs/locale/uk'),
  ur: () => require('dayjs/locale/ur'),
  'uz-latn': () => require('dayjs/locale/uz-latn'),
  uz: () => require('dayjs/locale/uz'),
  vi: () => require('dayjs/locale/vi'),
  yo: () => require('dayjs/locale/yo'),
  'zh-cn': () => require('dayjs/locale/zh-cn'),
  'zh-hk': () => require('dayjs/locale/zh-hk'),
  'zh-tw': () => require('dayjs/locale/zh-tw'),
  zh: () => require('dayjs/locale/zh'),
};
/* eslint-enable global-require */

const loadLocales = () => {
  Object.keys(locales).forEach((locale) => {
    locales[locale]();
    dayjs.locale(locale);
  });
  dayjs.locale('en');
};

loadLocales();

export const DAYJS_INPUT_FORMATS = {
  SECONDS: 'L HH:mm:ss',
  RANGE: 'L HH:mm',
};

export default dayjs;
