import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'lojas'

  public async up() {
    const hasEstadoColumn = await this.schema.hasColumn(this.tableName, 'estado')
    const hasVinculadoArmazemColumn = await this.schema.hasColumn(this.tableName, 'is_vinculado_armazem')

    this.schema.alterTable(this.tableName, (table) => {
      // Modify existing columns
      table.string('endereco', 255).notNullable().alter()
      table.string('telefone', 20).notNullable().alter()
      
      // Only add columns if they don't exist
      if (!hasEstadoColumn) {
        table.string('estado', 50).notNullable().defaultTo('ativa')
      }
      
      if (!hasVinculadoArmazemColumn) {
        table.boolean('is_vinculado_armazem').notNullable().defaultTo(false)
      }
    })
  }

  public async down() {
    // Get the column states first
    const hasEstadoColumn = await this.schema.hasColumn(this.tableName, 'estado')
    const hasVinculadoArmazemColumn = await this.schema.hasColumn(this.tableName, 'is_vinculado_armazem')

    await this.schema.alterTable(this.tableName, (table) => {
      // Revert the changes
      table.string('endereco').nullable().alter()
      table.string('telefone').nullable().alter()
      
      // Drop columns if they exist
      if (hasEstadoColumn) {
        table.dropColumn('estado')
      }
      
      if (hasVinculadoArmazemColumn) {
        table.dropColumn('is_vinculado_armazem')
      }
    })
  }
}
