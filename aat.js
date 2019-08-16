module.exports = {
  authToken: process.env.AAT_AUTH_TOKEN,
  ruleArchive: 'latest',
  policies: ['IBM_Accessibility_WCAG21'],
  failLevels: ['violation'],
  reportLevels: [
    'violation',
    'potentialviolation',
    'recommendation',
    'potentialrecommendation',
    'manual',
  ],
  captureScreenshots: true,
  outputFormat: ['json'],
  label: ['master'],
  outputFolder: 'results',
  checkHiddenContent: false,
  baseA11yServerURL: 'https://able.ibm.com/tools',
};
