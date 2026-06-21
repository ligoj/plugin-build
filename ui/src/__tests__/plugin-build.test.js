/*
 * Contract tests for plugin-build (service-level CI/Build plugin).
 *
 * Covers the manifest, i18n merge, `subPluginIdFor`, and the parent →
 * child delegation to the sibling plugin-build-jenkins.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { pluginRegistry, useI18nStore } from '@ligoj/host'
import pluginBuildDef from '../index.js'
import { subPluginIdFor } from '../service.js'
import pluginBuildJenkinsDef from '../../../../plugin-build-jenkins/ui/src/index.js'

beforeEach(() => {
  setActivePinia(createPinia())
})

describe('plugin-build manifest', () => {
  it('exports required service-level fields (no requires, no routes)', () => {
    expect(pluginBuildDef.id).toBe('build')
    expect(typeof pluginBuildDef.label).toBe('string')
    expect(pluginBuildDef.requires).toBeUndefined()
    expect(pluginBuildDef.routes).toBeUndefined()
    expect(typeof pluginBuildDef.install).toBe('function')
    expect(typeof pluginBuildDef.feature).toBe('function')
    expect(pluginBuildDef.service).toBeTypeOf('object')
    expect(pluginBuildDef.meta).toMatchObject({ icon: expect.any(String), color: expect.any(String) })
  })

  it('install() merges i18n', () => {
    const i18n = useI18nStore()
    pluginBuildDef.install()
    expect(i18n.t('service:build')).toBe('Build')
    expect(i18n.t('service:build:success')).toBe('Success')
  })

  it('feature() throws for an unknown action', () => {
    expect(() => pluginBuildDef.feature('nope')).toThrow(/no feature "nope"/)
  })

  it('renders nothing without a registered tool plugin', () => {
    expect(pluginBuildDef.feature('renderFeatures', { node: { id: 'service:build:jenkins:1' }, parameters: {} })).toEqual([])
    expect(pluginBuildDef.feature('renderDetailsKey', { node: { id: 'service:build:jenkins:1' }, parameters: {} })).toBeNull()
  })
})

describe('subPluginIdFor', () => {
  it('maps a tool/instance node to build-<tool>', () => {
    expect(subPluginIdFor({ node: { id: 'service:build:jenkins:1' } })).toBe('build-jenkins')
    expect(subPluginIdFor({ node: { id: 'service:build:jenkins' } })).toBe('build-jenkins')
  })
  it('returns null when there is no tool segment', () => {
    expect(subPluginIdFor({ node: { id: 'service:build' } })).toBeNull()
    expect(subPluginIdFor({})).toBeNull()
  })
})

describe('plugin-build → plugin-build-jenkins delegation', () => {
  beforeEach(() => {
    pluginBuildDef.install()
    pluginBuildJenkinsDef.install()
    pluginRegistry.register('build-jenkins', pluginBuildJenkinsDef)
  })
  afterEach(() => {
    pluginRegistry.remove('build-jenkins')
  })

  it('appends the Jenkins job link to renderFeatures output', () => {
    const result = pluginBuildDef.feature('renderFeatures', {
      id: 5,
      node: { id: 'service:build:jenkins:1' },
      parameters: {
        'service:build:jenkins:url': 'https://ci.example.org',
        'service:build:jenkins:job': 'ligoj-build',
      },
    })
    expect(result.length).toBe(1)
    for (const node of result) expect(node.__v_isVNode).toBe(true)
    expect(result[0].props.href).toBe('https://ci.example.org/job/ligoj-build')
  })

  it('does not delegate for a non-jenkins tool', () => {
    const result = pluginBuildDef.feature('renderFeatures', {
      id: 5,
      node: { id: 'service:build:other:1' },
      parameters: { 'service:build:jenkins:url': 'https://ci.example.org' },
    })
    expect(result).toEqual([])
  })
})
