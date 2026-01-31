// config/static.ts
import { defineConfig } from '@adonisjs/static'

export default defineConfig({
  /**
   * Whether to enable static assets serving
   */
  enabled: true,

  /**
   * The path prefix for static assets
   */
  path: 'public',

  /**
   * Whether to enable etag generation
   */
  etag: true,

  /**
   * Whether to enable last-modified header
   */
  lastModified: true,
  
  /**
   * HTTP Headers to be set when serving static files
   */
  headers: (_path: string, _stats: any) => ({
    'Cache-Control': 'public, max-age=31536000, immutable',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-XSS-Protection': '1; mode=block',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  }),

  /**
   * Set to true to handle HTTP range requests
   */
  range: false,
  
  /**
   * Set to false to disable directory listing
   */
  list: false,
  
  /**
   * Set to true to use the original file's extension in the URL
   */
  extensions: false,
  
  /**
   * Set to true to serve index.html when a directory is requested
   */
  index: 'index.html',
  
  /**
   * Set to true to enable gzip compression
   */
  gzip: true,
  
  /**
   * Set to true to enable brotli compression
   */
  brotli: false,
})