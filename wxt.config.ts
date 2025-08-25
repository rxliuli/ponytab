import { defineConfig, UserManifest } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion: 3,
  manifest: (env) => {
    const manifest: UserManifest = {
      name: 'PonyTab',
      description:
        'A beautiful browser extension that replaces your new tab page with stunning My Little Pony artwork by Sam Baneko.',
      permissions: ['storage', 'alarms'],
      host_permissions: ['https://ponytab.rxliuli.com/*'],
      chrome_url_overrides: {
        newtab: 'newtab.html',
      },
      author: {
        email: 'rxliuli@gmail.com',
      },
      homepage_url: 'https://rxliuli.com/project/ponytab',
    }
    if (env.browser === 'firefox') {
      manifest.browser_specific_settings = {
        gecko: {
          id: 'ponytab@rxliuli.com',
        },
      }
      // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/author
      // @ts-expect-error
      manifest.author = 'rxliuli'
    }
    return manifest
  },
  webExt: {
    disabled: true,
  },
})
