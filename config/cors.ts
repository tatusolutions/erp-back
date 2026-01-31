import { defineConfig } from '@adonisjs/cors'

// Configuração do CORS
const corsConfig = defineConfig({
  enabled: true,
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  headers: ['*'],
  exposeHeaders: [
    'Content-Range',
    'X-Total-Count',
    'Content-Length',
    'X-Requested-With',
    'X-Custom-Header'
  ],
  credentials: true,
  maxAge: 600 // 10 minutes
})

export default corsConfig
