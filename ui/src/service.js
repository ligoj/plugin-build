/*
 * Service layer for plugin "build" (CI/Build, service-level).
 *
 * As with `bt`, the legacy `service/build/build.js` base class rendered
 * links and detail carousels using tool-specific parameters
 * (`service:build:jenkins:*`). In the Vue split the tool owns its
 * rendering and the parent delegates — the `vm` → `vm-aws` pattern.
 *
 * So `build` contributes generic CI i18n (see ./i18n) plus delegation of
 * the subscription-row hooks to the build-<tool> sub-plugin. The
 * delegation plumbing (`subPluginIdFor` / `delegateToToolPlugin`) is the
 * host's shared `toolPluginId` / `delegateFeature` — identical across all
 * service parents — re-exported here so existing callers keep working.
 *
 * Kept free of Vue SFC imports so it can be unit-tested without a DOM.
 */
import { toolPluginId, delegateFeature } from '@ligoj/host'

/**
 * `service:build:jenkins:1` → `build-jenkins`; null when there is no tool
 * segment to delegate to.
 */
export const subPluginIdFor = toolPluginId

/** Delegate `action` to the build-<tool> sub-plugin; `[]` on any failure. */
export const delegateToToolPlugin = (subscription, action) => delegateFeature(subscription, action, 'build')

const service = {
  subPluginIdFor,
  delegateToToolPlugin,

  /** Subscription-row buttons — delegated wholesale to the build-<tool>. */
  renderFeatures(subscription) {
    return delegateToToolPlugin(subscription, 'renderFeatures')
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
