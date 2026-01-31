import { HttpContext } from '@adonisjs/core/http'

export default class CorsMiddleware {
  async handle(
    { request, response }: HttpContext,
    next: () => Promise<void>
  ) {
    const origin = request.header('origin') || '*'
    
    // Handle preflight requests
    if (request.method() === 'OPTIONS') {
      response.header('Access-Control-Allow-Origin', origin)
      response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Custom-Header, X-Socket-ID'
      )
      response.header('Access-Control-Allow-Credentials', 'true')
      response.header('Access-Control-Max-Age', '86400') // 24 hours
      return response.status(204).send('')
    }

    // For actual requests
    response.header('Access-Control-Allow-Origin', origin)
    response.header('Access-Control-Allow-Credentials', 'true')
    response.header(
      'Access-Control-Expose-Headers',
      'Content-Range, X-Total-Count, Content-Length, X-Requested-With, X-Custom-Header'
    )

    await next()
  }
}
