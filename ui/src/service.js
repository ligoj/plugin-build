/*
 * Service layer for plugin "build" (CI/Build, service-level).
 *
 * As with `bt`, the legacy `service/build/build.js` base class rendered
 * links and detail carousels using tool-specific parameters
 * (`service:build:jenkins:*`). In the Vue split the tool owns its
 * rendering and the parent delegates — the `vm` → `vm-aws` pattern.
 *
 * So `build` contributes generic CI i18n (see ./i18n) plus delegation of
 * the subscription-row hooks to the build-<tool> sub-plugin.
 *
 * Kept free of Vue SFC imports so it can be unit-tested without a DOM.
 */
import { pluginRegistry } from '@ligoj/host'

/**
 * Derive the sub-plugin id for a build tool subscription. A build node
 * id is `service:build:<tool>[:<instance>]` — segment 3 is the tool, so
 * `service:build:jenkins:1` → `build-jenkins`. Returns null when there
 * is no tool segment to delegate to.
 */
export function subPluginIdFor(subscription) {
  const id = subscription?.node?.id || ''
  const parts = id.split(':').filter(Boolean)
  if (parts.length < 3) return null
  return `${parts[1]}-${parts[2]}`
}

/**
 * Calls `feature(action, subscription)` on the loaded build-<tool>
 * sub-plugin and returns its VNodes (or an empty array). Degrades to
 * `[]` when nothing is registered, the plugin lacks the action, or the
 * call throws — a sub-plugin must never break the parent's rendering.
 */
export function delegateToToolPlugin(subscription, action) {
  const subId = subPluginIdFor(subscription)
  if (!subId) return []
  const plugin = pluginRegistry.get(subId)
  if (typeof plugin?.feature !== 'function') return []
  try {
    const result = plugin.feature(action, subscription)
    if (result == null) return []
    return Array.isArray(result) ? result : [result]
  } catch (err) {
    if (!new RegExp(`no feature ["']${action}["']`).test(err?.message || '')) {
      console.warn(`[plugin:build] delegate to ${subId}.${action} threw`, err)
    }
    return []
  }
}

const service = {
  subPluginIdFor,
  delegateToToolPlugin,

  /** Subscription-row buttons — delegated wholesale to the build-<tool>. */
  renderFeatures(subscription) {
    const out = delegateToToolPlugin(subscription, 'renderFeatures')
    return out.length ? out : []
  },

  /** Resource-key chips for the details column — delegated to the tool. */
  renderDetailsKey(subscription) {
    const out = delegateToToolPlugin(subscription, 'renderDetailsKey')
    return out.length ? out : null
  },

  /** Live detail chips — delegated to the tool. */
  renderDetailsFeatures(subscription) {
    const out = delegateToToolPlugin(subscription, 'renderDetailsFeatures')
    return out.length ? out : null
  },
}

export default service
