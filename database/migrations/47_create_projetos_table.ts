import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Projetos extends BaseSchema {
  protected tableName = 'projetos'

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
        .integer('id_gestor')
        .unsigned()
        .references('id')
        .inTable('colaboradores')
        .onDelete('SET NULL')

      table.string('responsavel').nullable()

      /* ===== Dados básicos ===== */
      table.string('nome', 150).notNullable()
      table.text('descricao').nullable()
      table.string('codigo', 50).nullable().unique()
      table.string('status', 30).notNullable().defaultTo('planejamento')
      table.string('prioridade', 20).notNullable().defaultTo('media')

      /* ===== Datas ===== */
      table.date('data_inicio').nullable()
      table.date('data_fim_prevista').nullable()
      table.date('data_fim_real').nullable()

      /* ===== Financeiro ===== */
      table.decimal('orcamento', 15, 2).nullable()
      table.decimal('custo_atual', 15, 2).nullable()
      table.decimal('custo_real', 15, 2).nullable()

      /* ===== Progresso ===== */
      table.integer('progresso').defaultTo(0).unsigned()

      /* ===== Informações adicionais ===== */
      table.string('tipo', 50).nullable()
      table.string('cliente', 150).nullable()
      table.string('localizacao', 255).nullable()
      table.text('observacoes').nullable()

      /* ===== Aprovação ===== */
      table.boolean('requer_aprovacao').defaultTo(false)
      table
        .integer('aprovado_por')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')
      table.date('data_aprovacao').nullable()

      /* ===== Timestamps ===== */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
