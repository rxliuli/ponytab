import { StorageAdapter } from './types'

/**
 * LocalStorage adapter for regular browser environments
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'ponytab_'

  async get(keys: string | string[]): Promise<Record<string, any>> {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    const result: Record<string, any> = {}

    for (const key of keyArray) {
      const value = localStorage.getItem(this.prefix + key)
      if (value !== null) {
        try {
          result[key] = JSON.parse(value)
        } catch {
          result[key] = value
        }
      }
    }

    return result
  }

  async set(items: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      localStorage.setItem(this.prefix + key, JSON.stringify(value))
    }
  }

  async remove(keys: string | string[]): Promise<void> {
    const keyArray = Array.isArray(keys) ? keys : [keys]
    for (const key of keyArray) {
      localStorage.removeItem(this.prefix + key)
    }
  }
}
