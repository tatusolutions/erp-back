import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mapa_irt'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Descrição do escalão
      table.string('nome', 50).notNullable().comment('Descrição do escalão (Até, De, Acima)')
      
      // Valores do escalão
      table.decimal('valor_de', 15, 2).notNullable().defaultTo(0).comment('Valor inicial do escalão')
      table.decimal('valor_ate', 15, 2).notNullable().defaultTo(0).comment('Valor final do escalão')
      
      // Tipo de cálculo
      table.string('parcela', 20).defaultTo('Parcela Fixa').comment('Tipo de parcela')
      
      // Valores de cálculo
      table.decimal('valor', 15, 2).notNullable().defaultTo(0).comment('Valor fixo do escalão')
      table.decimal('percentagem', 5, 2).notNullable().defaultTo(0).comment('Percentagem aplicável')
      
      // Isenção
      table.string('isento', 50).nullable().comment('Descrição de isenção')
      table.decimal('total', 15, 2).notNullable().defaultTo(0).comment('Valor total')
      
      // Status
      table.string('status', 20).defaultTo('activo').notNullable()
      
      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
