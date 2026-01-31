import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'relatorios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      
      // Dados do relatório
      table.integer('id_tipo_folha').notNullable()
      table.integer('ano').notNullable()
      table.integer('mes').notNullable()
      
      // Relacionamentos
      table.integer('id_empresa').unsigned().nullable()
      table.integer('id_usuario').unsigned().nullable()
      
      // Arquivo
      table.string('nome_arquivo').nullable()
      table.string('caminho_arquivo').nullable()
      
      // Status
      table.string('status').defaultTo('gerado')
      
      // Timestamps
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
      
      // Índices
      table.index(['id_tipo_folha', 'ano', 'mes'])
      table.index(['id_empresa'])
      table.index(['id_usuario'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}