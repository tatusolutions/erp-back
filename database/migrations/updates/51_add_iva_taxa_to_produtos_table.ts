import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produtos'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('iva_taxa', 5, 2).nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('iva_taxa')
    })
  }
}