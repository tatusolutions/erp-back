import { BaseSchema } from '@adonisjs/lucid/schema'
import { table } from 'console'

export default class extends BaseSchema {
  protected tableName = 'documento_itens'

  public async up() {
    const hasTable = await this.schema.hasTable(this.tableName)
    if (hasTable) return

    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()

      // Foreign key to the documentos table
      table.integer('documento_id').unsigned().notNullable()
        .references('id').inTable('documentos').onDelete('CASCADE')

      table.integer('id_empresa').unsigned().notNullable().references('id').inTable('empresas').onDelete('CASCADE')


      table.integer('produto_id').unsigned().notNullable()
        .references('id').inTable('produtos')
      table.dateTime('data_criacao').notNullable()
      // Item details
      table.decimal('preco_unitario', 15, 2).notNullable()
      table.decimal('quantidade', 10, 2).notNullable().defaultTo(1)
      table.decimal('desconto', 10, 2).defaultTo(0)
      table.decimal('iva', 5, 2).notNullable().defaultTo(0)
      table.decimal('total', 15, 2).notNullable()

      // Description (can be different from product name if product changes later)
      table.string('descricao').notNullable()
      table.string('desconto_fora').notNullable().defaultTo('monetario')

      // Unit of measure (can be different from product UoM if it changes)
      table.string('unidade_medida', 20).notNullable().defaultTo('un')

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).notNullable()

      // Indexes
      table.index(['documento_id'], 'documento_itens_documento_id_index')
      table.index(['produto_id'], 'documento_itens_produto_id_index')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
