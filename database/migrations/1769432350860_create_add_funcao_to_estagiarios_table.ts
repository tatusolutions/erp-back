import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'estagiarios'
  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('funcao').nullable().after('nome')
    })
  }
  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('funcao')
    })
  }
}