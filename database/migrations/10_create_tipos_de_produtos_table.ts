import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tipos_de_produtos'

  async up() {
    // Create the table
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 100).notNullable().unique()
      table.string('codigo', 20).notNullable().unique()
      table.string('descricao', 255).nullable()
      table.string('status', 20).defaultTo('ativo').notNullable()
      table.timestamps(true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
