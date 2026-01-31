import { BaseSchema } from '@adonisjs/lucid/schema'

export default class ProdutosArmazens extends BaseSchema {
  protected tableName = 'produtos_armazens'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('id_empresa')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('CASCADE')
      table
        .integer('id_produto')
        .unsigned()
        .references('id')
        .inTable('produtos')
        .onDelete('CASCADE')
      table
        .integer('id_armazem')
        .unsigned()
        .references('id')
        .inTable('armazens')
        .onDelete('CASCADE')
      table.integer('quantidade').notNullable().defaultTo(0)
      table.string('status', 100).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
