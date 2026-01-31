import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Clientes extends BaseSchema {
  protected tableName = 'clientes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('nome', 150).notNullable()
      table.string('foto', 255).nullable()
      table.string('telefone', 50).nullable()
      table.string('nif', 20).nullable()
      table.string('email', 100).nullable()
      table.string('status_cativo', 50).nullable()
      table.boolean('is_cativo').defaultTo(false)
      table.integer('id_grupo_preco').unsigned().nullable()
      table.boolean('is_retencao').defaultTo(false)
      table.boolean('is_grupo_preco').defaultTo(false)
      table.decimal('retencao', 8, 2).nullable()
      table.integer('id_municipio').unsigned().nullable()
      table.integer('id_provincia').unsigned().nullable()
      table.string('endereco', 255).nullable()
      table.string('codigoPostal', 20).nullable()
      table.integer('id_empresa').unsigned().nullable()
      table.string('estado', 50).nullable()
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now())
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now())

      // Foreign Keys
      table.foreign('id_grupo_preco').references('id').inTable('grupo_precos').onDelete('SET NULL')
      table.foreign('id_municipio').references('id').inTable('municipios').onDelete('SET NULL')
      table.foreign('id_provincia').references('id').inTable('provincias').onDelete('SET NULL')
      table.foreign('id_empresa').references('id').inTable('empresas').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
