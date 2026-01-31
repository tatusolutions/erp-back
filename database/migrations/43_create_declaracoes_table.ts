import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'declaracoes'

  public async up() {
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      // Chaves estrangeiras
      table.integer('id_empresa').unsigned().nullable()
      table.integer('id_colaborador').unsigned().nullable()
      table.integer('user_id').unsigned().nullable()

      // Campos da tabela
      table.string('efeito', 50).notNullable()
      table.string('finalidade', 255).nullable()
      table.string('estado', 50).notNullable().defaultTo('pendente')
      
      // Timestamps
      table.timestamp('created_at')
      table.timestamp('updated_at')

      // Chaves estrangeiras
      table
        .foreign('id_empresa')
        .references('id')
        .inTable('empresas')
        .onDelete('SET NULL')

      table
        .foreign('id_colaborador')
        .references('id')
        .inTable('colaboradores')
        .onDelete('SET NULL')

      table
        .foreign('user_id')
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
