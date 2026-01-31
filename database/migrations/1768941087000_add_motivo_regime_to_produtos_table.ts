import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produtos'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('motivo_regime', 100).nullable().after('status')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('motivo_regime')
    })
  }
}
