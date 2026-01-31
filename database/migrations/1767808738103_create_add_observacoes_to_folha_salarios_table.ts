import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddObservacoesToFolhaSalarios extends BaseSchema {
  protected tableName = 'folha_salario'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('observacoes').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('observacoes')
    })
  }
}