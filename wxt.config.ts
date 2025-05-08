import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifestVersion: 3,
  manifest: {
    name: 'PonyTab',
    description:
      'A beautiful Chrome extension that replaces your new tab page with stunning My Little Pony artwork by Sam Baneko.',
    permissions: ['storage', 'alarms'],
    host_permissions: ['https://ponytab.rxliuli.com/*'],
    chrome_url_overrides: {
      newtab: 'newtab.html',
    },
    author: {
      email: 'rxliuli@gmail.com',
    },
    homepage_url: 'https://rxliuli.com/project/ponytab',
  },
  webExt: {
    disabled: true,
  },
})
