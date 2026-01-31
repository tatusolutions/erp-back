import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'modelos_faturas_bancos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('banco_id').unsigned().references('id').inTable('bancos').onDelete('CASCADE')
      table
        .integer('modelos_factura_id')
        .unsigned()
        .references('id')
        .inTable('modelos_facturas')
        .onDelete('CASCADE')
      table.string('iban', 100).nullable()
      table.string('n_conta', 100).nullable()

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
