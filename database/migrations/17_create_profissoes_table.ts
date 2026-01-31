import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'profissoes'


  public async up() {
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary() 
      table.string('nome', 200)  
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}