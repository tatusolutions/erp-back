import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'armazens'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 100).notNullable()
      table.string('serie', 50).nullable()
      table.string('endereco', 150).nullable()
      table.string('descricao', 150).nullable()
      table.string('estado', 100).nullable()
      //table.integer('id_loja').unsigned().references('id').inTable('lojas').onDelete('CASCADE')
      table.integer('id_empresa').unsigned().references('id').inTable('empresas').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
