import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev only: serve /api/* from the same handler Vercel runs in production,
// since plain Vite does not serve the api/ folder.
const devApi = () => ({
  name: 'dev-api',
  configureServer(server) {
    server.middlewares.use('/api', async (req, res) => {
      const route = req.url.split('?')[0].replace(/^\//, '')
      if (!['reanime', 'news'].includes(route)) {
        res.statusCode = 404
        return res.end()
      }
      const { default: handler } = await server.ssrLoadModule(`/api/${route}.js`)
      const query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
      handler(
        { query },
        {
          setHeader: (k, v) => res.setHeader(k, v),
          status: (code) => {
            res.statusCode = code
            return { send: (body) => res.end(body) }
          },
          redirect: (code, url) => {
            res.statusCode = code
            res.setHeader('Location', url)
            res.end()
          },
        }
      )
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devApi()],
})
