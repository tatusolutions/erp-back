import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types'

export default class DatabaseSeeder extends BaseCommand {
  static options: CommandOptions = {
    startApp: true,
  }

  static commandName = 'db:seed'
  static description = 'Seed database with records'

  async run() {
    const { default: TiposDeProdutoSeeder } = await import('./tipos_de_produto_seeder.js')
    const { default: MapaIRTSeeder } = await import('./mapa_irt_seeder.js')
    
    await new TiposDeProdutoSeeder().run()
    await new MapaIRTSeeder().run()
    
    this.logger.success('✅ Database seeded successfully')
  }
}
