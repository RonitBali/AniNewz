import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Dev only: serve /api/reanime from the same handler Vercel runs in production,
// since plain Vite does not serve the api/ folder.
const devApi = () => ({
  name: 'dev-api-reanime',
  configureServer(server) {
    server.middlewares.use('/api/reanime', async (req, res) => {
      const { default: handler } = await server.ssrLoadModule('/api/reanime.js')
      const query = Object.fromEntries(new URL(req.url, 'http://localhost').searchParams)
      handler(
        { query },
        {
          setHeader: (k, v) => res.setHeader(k, v),
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
