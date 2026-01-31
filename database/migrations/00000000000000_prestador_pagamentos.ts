// database/migrations/00000000000000_prestador_pagamentos.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class PrestadorPagamentos extends BaseSchema {
  protected tableName = 'prestador_pagamentos'

  async up() {
    // Criar a tabela
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('prestador_id').unsigned().notNullable()
        .references('id').inTable('prestadores')
        .onDelete('CASCADE')
      table.integer('ano').notNullable()
      table.integer('mes').notNullable()
      table.decimal('valor', 10, 2).notNullable()
      table.dateTime('data_pagamento').notNullable()
      table.text('observacoes').nullable()
      table.integer('empresa_id').unsigned().nullable()
      table.integer('usuario_id').unsigned().nullable()
      table.string('status', 50).defaultTo('pendente')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    }) 
  }

  async down() {
    // Remover a trigger
    await this.schema.raw('DROP TRIGGER IF EXISTS check_prestador_pagamento_duplicado;')
    // Remover a tabela
    this.schema.dropTable(this.tableName)
  }
}