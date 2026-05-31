// Generic build/CI i18n for the service-level "build" plugin. Tool
// plugins (build-jenkins) ship their own `service:build:<tool>:*`
// parameter labels. Flat keys to match the host's vue-i18n resolver.
export default {
  'service:build': 'Build',
  'service:build:building': 'Building',
  'service:build:failed': 'Failed',
  'service:build:disabled': 'Disabled',
  'service:build:success': 'Success',
  'service:build:unstable': 'Unstable',
  'service:build:not-built': 'Not built',
}
