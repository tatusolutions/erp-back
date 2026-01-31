import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'produtos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 100).notNullable()
      table.string('logotipo', 255).nullable()
      table
        .integer('id_tipo_produto')
        .unsigned()
        .references('id')
        .inTable('tipos_de_produtos')
        .onDelete('SET NULL')
      table
        .integer('id_empresa')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('CASCADE')
      table.string('referencia', 100).nullable()
      table
        .integer('id_linhas_regime')
        .unsigned()
        .references('id')
        .inTable('linhas_regimes')
        .onDelete('SET NULL')
      table.decimal('iva', 10, 2).defaultTo(0)
      table.decimal('preco_custo', 15, 2).defaultTo(0)
      table.decimal('preco_venda', 15, 2).defaultTo(0)
      table.decimal('pvp', 15, 2).defaultTo(0)
      table.decimal('margem', 10, 2).defaultTo(0)
      table.boolean('tem_preco_com_iva').defaultTo(false)
      table.boolean('tem_categoria').defaultTo(false)
      table.boolean('tem_marca').defaultTo(false)
      table.integer('id_marca').unsigned().references('id').inTable('marcas').onDelete('SET NULL')
      table
        .integer('id_variacao')
        .unsigned()
        .references('id')
        .inTable('variacoes')
        .onDelete('SET NULL')
      table
        .integer('id_categoria')
        .unsigned()
        .references('id')
        .inTable('categorias')
        .onDelete('SET NULL')
      table.boolean('tem_estoque').defaultTo(true)
      table.boolean('tem_variacao').defaultTo(true)
      table.string('status', 20).nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
