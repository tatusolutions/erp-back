import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'mapa_de_taxas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Taxas de Segurança Social
      table.decimal('ss', 5, 2).notNullable().defaultTo(0).comment('Taxa de Segurança Social geral')
      table.decimal('ss_empresa', 5, 2).notNullable().defaultTo(0).comment('Taxa de Segurança Social - quota patronal')
      table.decimal('ss_trabalhador', 5, 2).notNullable().defaultTo(0).comment('Taxa de Segurança Social - quota trabalhador')
      
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
