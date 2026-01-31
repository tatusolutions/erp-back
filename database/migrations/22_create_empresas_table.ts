import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'empresas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome_comercial', 255).notNullable()
      table.string('nome_conservatoria', 255).nullable()
      table.decimal('capital_social', 62, 2).nullable()
      table.string('email', 255).nullable()
      table.string('segurancaSocial', 100).nullable()
      table.string('nif', 50).nullable()
      table.string('nss', 50).nullable()
      table.string('dias_uteis', 255).nullable()
      table.string('fax', 50).nullable()
      table.string('telefone', 50).nullable()
      table.string('endereco', 255).nullable()
      table.string('website', 255).nullable()
      table.string('logotipo', 200).nullable()
      table
        .integer('id_municipio')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('municipios')
        .onDelete('CASCADE')
      table
        .integer('id_moeda')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('moedas')
        .onDelete('CASCADE')
      table.boolean('status').defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
