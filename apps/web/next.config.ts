import type { NextConfig } from 'next'

const config: NextConfig = {
  // @react-pdf/renderer usa APIs nativas de Node.js (Canvas, streams)
  // que no son compatibles con el bundler de webpack. Al marcarlo como
  // externo, Next.js lo carga directamente desde node_modules en el
  // runtime de Node (nunca en Edge).
  serverExternalPackages: ['@react-pdf/renderer'],
}

export default config
