import { Hono } from 'hono'

const app = new Hono<{
  Bindings: Cloudflare.Env
}>()

app.get('*', async (c) => {
  const path = new URL(c.req.url).pathname
  if (!path.endsWith('.png') && !path.endsWith('/wallpaper.json')) {
    return c.notFound()
  }
  const key = path.startsWith('/') ? path.slice(1) : path
  const r = await c.env.MY_BUCKET.get(key)
  if (!r) {
    return c.notFound()
  }
  const headers = new Headers()
  r.writeHttpMetadata(headers)
  headers.set('etag', r.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000')
  return new Response(r.body, {
    headers,
  })
})

export default app
