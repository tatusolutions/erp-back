import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Colaboradores extends BaseSchema {
  protected tableName = 'colaboradores'

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

      table.integer('id_cargo').unsigned().nullable()
      table.integer('id_estabelecimento').unsigned().nullable()

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      /* ===== Dados pessoais ===== */
      table.string('foto').nullable()
      table.string('nome', 150).notNullable()
      table.string('bi', 30).notNullable().unique()
      table.date('data_bi_validade').notNullable()
      table.date('data_nascimento').notNullable()
      table.date('data_vinculo').notNullable()

      table.string('sexo', 20).notNullable()
      table.string('estado_civil', 30).notNullable()
      table.string('estado', 30).defaultTo('activo')

      table.string('endereco', 255).notNullable()
      table.string('telefone_principal', 20).notNullable()
      table.string('telefone_alternativo', 20).nullable()
      table.string('email', 150).nullable()

      table.string('nss', 50).nullable()

      /* ===== Dados bancários ===== */
      table.string('tipo_pagamento', 20).nullable()
      table.string('iban', 50).nullable()
      table.integer('id_banco').unsigned().nullable()
      table.string('numero_conta', 50).nullable()

      /* ===== Remuneração ===== */
      table.decimal('salario_base', 15, 2).nullable()
      table.decimal('total_base', 15, 2).nullable()
      table.decimal('total_subsidios', 15, 2).nullable()
      table.decimal('total_bruto', 15, 2).nullable()

      table.decimal('horas_extras', 15, 2).nullable()
      table.decimal('bonus', 15, 2).nullable()
      table.decimal('premios', 15, 2).nullable()
      table.decimal('outros_subsidios', 15, 2).nullable()
      table.decimal('adicionar_remuneracao', 15, 2).nullable()

      /* ===== Subsídios ===== */
      table.decimal('subsidio_alimentacao', 15, 2).nullable()
      table.decimal('subsidio_transporte', 15, 2).nullable()
      table.decimal('subsidio_noturno', 15, 2).nullable()
      table.decimal('subsidio_de_turno', 15, 2).nullable()
      table.decimal('subsidio_de_risco', 15, 2).nullable()
      table.decimal('subsidio_de_representacao', 15, 2).nullable()
      table.decimal('subsidio_de_regencia', 15, 2).nullable()
      table.decimal('subsidio_de_renda', 15, 2).nullable()
      table.decimal('subsidio_de_disponibilidade', 15, 2).nullable()
      table.decimal('subsidio_de_exame', 15, 2).nullable()
      table.decimal('subsidio_de_atavio', 15, 2).nullable()
      table.decimal('subsidio_de_ferias', 15, 2).nullable()

      table.string('subsidio_de_natal', 50).nullable()

      table.decimal('abono_familia', 15, 2).nullable()
      table.decimal('abono_para_falhas', 15, 2).nullable()

      /* ===== Timestamps ===== */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
