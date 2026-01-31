import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produtos'

  public async up() {
    const hasColumn = await this.schema.hasColumn(this.tableName, 'estoque_armazem')
    
    if (!hasColumn) {
      this.schema.alterTable(this.tableName, (table) => {
        table.integer('estoque_armazem').notNullable().defaultTo(0)
      })
    }
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('estoque_armazem')
    })
  }
}