import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reporte_safts'


  public async up() {
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.dateTime('data_inicio').notNullable()
      table.dateTime('data_fim').notNullable()
      table.integer('total_documentos').unsigned().defaultTo(0)
      table.string('estado', 20).defaultTo('pendente')
      table.string('caminho_arquivo').nullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('empresa_id').unsigned().references('id').inTable('empresas').onDelete('CASCADE')
      table.timestamps(true, true)
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}