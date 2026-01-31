import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddResponsavelAndCustoRealToProjetos extends BaseSchema {
  protected tableName = 'projetos'

  public async up () {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('responsavel').nullable()
      table.decimal('custo_real', 15, 2).nullable()
    })
  }

  public async down () {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('responsavel')
      table.dropColumn('custo_real')
    })
  }
}
