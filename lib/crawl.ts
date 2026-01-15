import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import filenamify from 'filenamify'
import { readdir, readFile, writeFile } from 'fs/promises'

interface WallpaperInfo {
  url: string
  title: string
}

async function collectLinks(): Promise<WallpaperInfo[]> {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  const wallpapers: WallpaperInfo[] = []

  for (let i = 0; i < 13; i++) {
    const pageUrl =
      'https://spacecatsamba.com/works/tag/my-little-pony-friendship-is-magic?page=' +
      i
    console.log(`Collecting links from page ${i}...`)
    await page.goto(pageUrl)

    const links = await page.$$('.permalink')
    for (const link of links) {
      const href = await link.getAttribute('href')
      if (!href) {
        console.log('pageUrl', pageUrl, 'link', link)
        throw new Error('No href found')
      }
      wallpapers.push({
        url: href,
        title: path.basename(href),
      })
    }
  }
  await browser.close()
  return wallpapers
}

async function downloadWallpapers(wallpapers: WallpaperInfo[]) {
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({
    acceptDownloads: true, // 启用下载
  })
  const page = await context.newPage()

  // Create downloads directory if it doesn't exist
  const downloadDir = path.join(process.cwd(), 'downloads')
  if (!fs.existsSync(downloadDir)) {
    fs.mkdirSync(downloadDir)
  }

  console.log(`Starting download of ${wallpapers.length} wallpapers...`)

  for (const wallpaper of wallpapers) {
    try {
      console.log(`Processing: ${wallpaper.title}`)
      await page.goto('https://spacecatsamba.com' + wallpaper.url)

      // 设置下载监听器
      const downloadPromise = page.waitForEvent('download')

      // Try to find and click the 4K download button
      const hasDownloadButton = await page.evaluate(() => {
        const selector = document.querySelector(
          '[name="wallpaper-id"].download-selector',
        ) as unknown as HTMLSelectElement
        const option = [...selector.options].find(
          (it) => it.text === '3840 x 2160',
        )
        if (!option) {
          console.error('No 4K option found')
          return false
        }
        selector.value = option.value
        const downloadBtn = document.querySelector(
          'button.download',
        ) as HTMLButtonElement
        if (!downloadBtn) {
          console.error('No download button found')
          return false
        }
        downloadBtn.click()
        return true
      })

      if (hasDownloadButton) {
        // 等待下载开始
        const download = await downloadPromise
        console.log(`Download started: ${download.suggestedFilename()}`)

        // 保存文件
        const filename = `${filenamify(wallpaper.title)}${path.extname(
          download.suggestedFilename(),
        )}`
        const filePath = path.join(downloadDir, filename)
        await download.saveAs(filePath)
        console.log(`Downloaded: ${filename}`)
      } else {
        console.log(`No download button found for ${wallpaper.title}`)
      }

      // Wait a bit between downloads to be nice to the server
      await page.waitForTimeout(1000)
    } catch (error) {
      console.error(`Error processing ${wallpaper.url}:`, error)
    }
  }

  await browser.close()
  console.log('Download completed!')
}

async function main() {
  try {
    // console.log('Starting link collection...')
    // const wallpapers = await collectLinks()
    // console.log(`Found total ${wallpapers.length} wallpapers`)

    // // Save links to a JSON file for reference
    // await writeFile(
    //   'wallpaper-links.json',
    //   JSON.stringify(wallpapers, null, 2),
    // )
    // console.log('Saved wallpaper links to wallpaper-links.json')
    const wallpapers = JSON.parse(
      await readFile(path.join(__dirname, 'wallpaper-links.json'), 'utf-8'),
    ) as WallpaperInfo[]

    await downloadWallpapers(wallpapers)
  } catch (error) {
    console.error('Error:', error)
  }

  const files = await readdir(path.join(__dirname, 'downloads'))

  await writeFile(
    path.join(__dirname, 'wallpaper.json'),
    JSON.stringify(files, null, 2),
  )
}

await main()
