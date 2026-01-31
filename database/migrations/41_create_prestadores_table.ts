import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Prestadores extends BaseSchema {
  protected tableName = 'prestadores'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /* ===== Chaves estrangeiras ===== */
      table
        .integer('id_empresa')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('SET NULL')

      table
        .integer('id_departamento')
        .unsigned()
        .references('id')
        .inTable('departamentos')
        .onDelete('SET NULL')

      table
        .integer('id_cargo')
        .unsigned()
        .references('id')
        .inTable('profissoes')
        .onDelete('SET NULL')

      table
        .integer('id_estabelecimento')
        .unsigned()
        .references('id')
        .inTable('estabelecimentos')
        .onDelete('SET NULL')

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      /* ===== Dados pessoais ===== */
      table.string('nome', 150).notNullable()
      table.string('tipo_grupo', 10).notNullable() // IRT - A, IRT - B, IRT - C, IAC
      table.string('nif', 20).notNullable().unique()
      table.string('telefone', 20).notNullable()
      table.string('telefone_alternativo', 20).nullable()
      table.string('email', 150).notNullable()
      table.string('endereco', 255).notNullable()
      table.string('estado', 30).defaultTo('ativo') // ativo, suspenso, desvinculado

      /* ===== Dados bancários ===== */
      table.string('tipo_pagamento', 20).notNullable().defaultTo('Banco') // Banco, Cash
      table.integer('id_banco').unsigned().nullable()
      table.string('numero_conta', 50).nullable()
      table.string('iban', 50).nullable()

      /* ===== Pagamento ===== */
      table.decimal('valor_pagamento', 15, 2).nullable()

      /* ===== Timestamps ===== */
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      /* ===== Índices ===== */
      table.index(['id_empresa'])
      table.index(['id_departamento'])
      table.index(['id_cargo'])
      table.index(['id_estabelecimento'])
      table.index(['user_id'])
      table.index(['estado'])
      table.index(['tipo_grupo'])
      table.index(['nif'])
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
