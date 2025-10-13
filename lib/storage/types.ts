/**
 * Storage adapter interface for cross-environment compatibility
 */
export interface StorageAdapter {
  get(keys: string | string[]): Promise<Record<string, any>>
  set(items: Record<string, any>): Promise<void>
  remove(keys: string | string[]): Promise<void>
}
