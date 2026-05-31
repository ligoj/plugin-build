# plugin-build — Vue UI

Vue source for the **build** service-level plugin (`service:build`,
"Build"/CI), parent of the build tools (`build-jenkins`). Compiled by Vite
into the Maven plugin JAR at
`../src/main/resources/META-INF/resources/webjars/build/vue/`, served by
the host at `/main/build/vue/index.js`.

The legacy `build.html` was an empty title well — there is no
per-subscription configuration screen. This plugin ships only:

- **i18n** — generic build-status labels (`service:build:*`).
- **delegation hooks** — `renderFeatures` / `renderDetailsKey` /
  `renderDetailsFeatures` resolve the `build-<tool>` sub-plugin via
  `subPluginIdFor` (`service:build:jenkins:1` → `build-jenkins`) and merge
  its VNodes in.

## Commands

```bash
npm install
npm run build   # → ../src/main/resources/.../webjars/build/vue/
npm run lint
npm test        # vitest — manifest + delegation contract tests
npm run dev     # standalone dev harness on :5182
```
