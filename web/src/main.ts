import { getWallpaperUrl, updateMetadata } from './lib/utils'
import './style.css'

function render(url: string) {
  document.body.style.backgroundImage = `url("${url}")`
}

async function main() {
  render(await getWallpaperUrl())

  updateMetadata()
}

main()
