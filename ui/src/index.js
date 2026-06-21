/*
 * Plugin "build" — CI/Build (service-level).
 *
 * Parent of the build-<tool> plugins (build-jenkins). It owns no view of
 * its own — the legacy `build.html` was an empty title well — so it ships
 * only:
 *   - generic build/CI i18n (status labels);
 *   - the parent→child delegation hooks that merge a tool plugin's row
 *     features / detail chips (e.g. plugin-build-jenkins's job link) into
 *     its own output, resolved via `subPluginIdFor`.
 *
 * Authored as source — compiled to `/main/build/vue/index.js` by Vite.
 */
import { useI18nStore } from '@ligoj/host'
import enMessages from './i18n/en.js'
import frMessages from './i18n/fr.js'
import service from './service.js'

const features = {
  renderFeatures: service.renderFeatures,
  renderDetailsKey: service.renderDetailsKey,
  renderDetailsFeatures: service.renderDetailsFeatures,
}

export default {
  id: 'build',
  label: 'Build',
  // No routes / component — CI screens come from the tool plugins and the
  // host's generic subscription rows.
  install() {
    const i18n = useI18nStore()
    i18n.merge(enMessages, 'en')
    i18n.merge(frMessages, 'fr')
  },
  feature(action, ...args) {
    const fn = features[action]
    if (!fn) throw new Error(`Plugin "build" has no feature "${action}"`)
    return fn(...args)
  },
  service,
  meta: { icon: 'mdi-cog-sync', color: 'blue-grey-darken-2' },
}

export { service }
