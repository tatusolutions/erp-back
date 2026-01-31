import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lojas'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.boolean('is_vinculado_armazem').defaultTo(false).notNullable()
      table.integer('id_armazem').unsigned().nullable()
      table.string('estado', 50).defaultTo('ativa').notNullable()
      
      // Add foreign key constraint
      table.foreign('id_armazem')
        .references('id')
        .inTable('armazens')
        .onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('id_armazem')
      table.dropColumn('is_vinculado_armazem')
      table.dropColumn('id_armazem')
      table.dropColumn('estado')
    })
  }
}
