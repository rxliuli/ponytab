const METADATA_API_URL = 'https://ponytab.rxliuli.com/wallpaper.json' // TODO: Replace with actual API URL
const STORAGE_KEYS = {
  WALLPAPER_METADATA: 'wallpaperMetadataList',
  LAST_UPDATE_TIME: 'lastMetadataUpdateTime',
  CURRENT_WALLPAPER: 'currentWallpaperUrl',
}
const CACHE_NAME = 'wallpaper-cache'

export async function cacheWallpaper(imageUrl: string): Promise<void> {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch wallpaper: ${response.status}`)
    }

    const cache = await caches.open(CACHE_NAME)
    await cache.put(imageUrl, response.clone())

    // Store the current wallpaper URL
    await browser.storage.local.set({
      [STORAGE_KEYS.CURRENT_WALLPAPER]: imageUrl,
    })
  } catch (error) {
    console.error('Failed to cache wallpaper:', error)
    throw error
  }
}

export async function getWallpaperUrl(): Promise<string> {
  const imageUrl = (
    await browser.storage.local.get(STORAGE_KEYS.CURRENT_WALLPAPER)
  ).currentWallpaperUrl
  if (!imageUrl) {
    return '/background.png'
  }
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(imageUrl)
  if (!response) {
    updateMetadata(true)
    return '/background.png'
  }
  const blob = await response.blob()
  const objectUrl = URL.createObjectURL(blob)
  return objectUrl
}

async function fetchMetadata() {
  try {
    const response = await fetch(METADATA_API_URL)
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    const metadata = await response.json()
    return metadata
  } catch (error) {
    console.error('Failed to fetch metadata:', error)
    throw error
  }
}

async function storeMetadata(metadata: any) {
  try {
    await browser.storage.local.set({
      [STORAGE_KEYS.WALLPAPER_METADATA]: metadata,
      [STORAGE_KEYS.LAST_UPDATE_TIME]: Date.now(),
    })
  } catch (error) {
    console.error('Failed to store metadata:', error)
    throw error
  }
}

async function shouldUpdateMetadata(duration: number): Promise<boolean> {
  try {
    const data = await browser.storage.local.get(STORAGE_KEYS.LAST_UPDATE_TIME)
    const lastUpdateTime = data[STORAGE_KEYS.LAST_UPDATE_TIME]

    if (!lastUpdateTime) return true

    // Check if 24 hours have passed since last update
    return Date.now() - lastUpdateTime >= duration
  } catch (error) {
    console.error('Failed to check metadata update status:', error)
    return true // Update on error to ensure we have data
  }
}

function selectRandomWallpaper(metadata: any[]): string {
  const randomIndex = Math.floor(Math.random() * metadata.length)
  return 'https://ponytab.rxliuli.com/' + metadata[randomIndex]
}

export async function updateMetadata(force: boolean = false) {
  try {
    const needsUpdate = await shouldUpdateMetadata(1000 * 60 * 60 * 24)
    if (!needsUpdate && !force) return

    const metadata = await fetchMetadata()
    await storeMetadata(metadata)

    // Select and cache a random wallpaper
    const selectedWallpaper = selectRandomWallpaper(metadata)
    await cacheWallpaper(selectedWallpaper)

    console.log('Metadata and wallpaper updated successfully')
  } catch (error) {
    console.error('Failed to update metadata:', error)
  }
}
