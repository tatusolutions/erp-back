import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'departamentos'


  public async up() {
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()  
      table.integer('id_empresa').unsigned().nullable()
      table.string('nome_departamento', 200)  
      table.string('chef_departamento', 200)  
      table.string('estado', 50).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')


      table.foreign('id_empresa').references('id').inTable('empresas').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}