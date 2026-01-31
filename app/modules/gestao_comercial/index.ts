import { ApplicationService } from '@adonisjs/core/types'
import { join } from 'node:path'
import { readdir } from 'node:fs/promises'

export default class GestaoComercialModule {
  constructor(protected app: ApplicationService) {}

  async boot() {
    // Register providers
    await this.registerProviders()
    
    // Register routes
    await this.registerRoutes()
  }

  async registerProviders() {
    // Register any providers here
  }

  async registerRoutes() {
    const router = this.app.container.make('router')
    const routeFiles = await readdir(join(__dirname, 'routes'))
    
    // Import and register all route files
    for (const file of routeFiles) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const routeModule = await import(join(__dirname, 'routes', file))
        if (typeof routeModule.default === 'function') {
          routeModule.default(router)
        }
      }
    }
  }
}
