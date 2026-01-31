import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nome_documentos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('id_tipo_documento')
        .unsigned()
        .references('id')
        .inTable('tipo_documentos')
        .onDelete('CASCADE')
      table.string('abreviacao', 5)
      table.string('nome', 100)
      table.string('estado', 10)
      table.string('hexadecimal', 100)
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
