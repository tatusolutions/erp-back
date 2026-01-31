import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'modelos_facturas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 255).notNullable()
      table.string('nif', 50).nullable()
      table.string('telefone', 50).nullable()
      table.string('endereco', 255).nullable()
      table.string('logotipo', 255).nullable()
      table.string('email', 255).nullable()

      table
        .integer('id_empresa')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('CASCADE')
      table.integer('id_usuario').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.boolean('tem_banco').defaultTo(false)
      table.boolean('tem_marca_d_agua').defaultTo(false)
      table.boolean('status').defaultTo(true)

      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
