declare module '@ioc:Adonis/Lucid/Seeder' {
  import { BaseCommand } from '@adonisjs/core/build/standalone'
  export default class BaseSeeder extends BaseCommand {
    public static developmentOnly: boolean
    public run(): Promise<void>
  }
}

declare module '@ioc:Adonis/Lucid/Database' {
  import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
  const Database: DatabaseContract
  export default Database
}
