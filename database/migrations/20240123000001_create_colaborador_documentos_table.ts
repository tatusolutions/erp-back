import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateColaboradorDocumentosTable extends BaseSchema {
  protected tableName = 'colaborador_documentos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /* ===== Chaves estrangeiras ===== */
      table
        .integer('id_colaborador')
        .unsigned()
        .references('id')
        .inTable('colaboradores')
        .onDelete('CASCADE')

      table
        .integer('id_tipo_documento')
        .unsigned()
        .references('id')
        .inTable('tipo_documentos')
        .onDelete('SET NULL')

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      /* ===== Dados do documento ===== */
      table.string('titulo', 200).notNullable()
      table.text('descricao').nullable()
      table.string('ficheiro', 500).notNullable() // Caminho do arquivo
      table.string('ficheiro_original', 255).notNullable() // Nome original do arquivo
      table.string('mime_type', 100).nullable()
      table.integer('tamanho_ficheiro').unsigned().nullable() // Tamanho em bytes

      /* ===== Metadados ===== */
      table.date('data_emissao').nullable()
      table.date('data_validade').nullable()
      table.string('estado', 20).defaultTo('activo') // activo, inactivo, expirado

      /* ===== Timestamps ===== */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
