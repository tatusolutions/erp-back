import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('name', 500).notNullable()
      table.string('morada', 255).nullable()
      table.string('email', 254).nullable()
      table.string('username', 100).nullable()
      table.string('password', 255).notNullable()
      table.string('foto', 254).nullable()
      table.string('telefone', 20).nullable()
      table.integer('id_role').unsigned().references('id').inTable('roles').onDelete('SET NULL')
      table
        .integer('empresa_id')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('SET NULL')
      table.boolean('is_online').notNullable().defaultTo(0)
      table.boolean('is_actived').notNullable().defaultTo(0)
      table.boolean('is_deleted').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
