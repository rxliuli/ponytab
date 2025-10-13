import { StorageAdapter } from './types'

/**
 * Browser extension storage adapter using browser.storage.local
 */
export class BrowserExtensionStorageAdapter implements StorageAdapter {
  async get(keys: string | string[]): Promise<Record<string, any>> {
    return await browser.storage.local.get(keys)
  }

  async set(items: Record<string, any>): Promise<void> {
    await browser.storage.local.set(items)
  }

  async remove(keys: string | string[]): Promise<void> {
    await browser.storage.local.remove(keys)
  }
}
