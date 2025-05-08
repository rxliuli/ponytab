import { updateMetadata } from '@/lib/utils'

export default defineBackground(() => {
  browser.runtime.onInstalled.addListener(async () => {
    await updateMetadata()

    await browser.alarms.create('fetchMetadataAlarm', {
      periodInMinutes: 1,
    })
  })

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'fetchMetadataAlarm') {
      updateMetadata()
    }
  })
})
