import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produtos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('custo', 15, 2).defaultTo(0).after('iva')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('custo')
    })
  }
}