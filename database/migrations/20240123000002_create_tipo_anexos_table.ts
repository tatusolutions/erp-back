import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateTipoAnexosTable extends BaseSchema {
  protected tableName = 'tipo_anexos'

  public async up () {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /* ===== Dados do tipo de anexo ===== */
      table.string('nome', 100).notNullable()
      table.string('abreviacao', 20).notNullable()
      table.text('descricao').nullable()
      
      /* ===== Status ===== */
      table.string('estado', 20).defaultTo('activo') // activo, inactivo

      /* ===== Timestamps ===== */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down () {
    this.schema.dropTable(this.tableName)
  }
}
