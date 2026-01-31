import { BaseSchema } from '@adonisjs/lucid/schema'

export default class SetupTaxRegimesTable extends BaseSchema {
  protected tableName = 'tax_regimes'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('code', 10).notNullable().unique()
      table.string('description').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // Insert default tax regimes
    await this.defer(async (db) => {
      await db.table(this.tableName).multiInsert([
        { code: 'M00', description: 'Regime Simplificado', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M02', description: 'Transmissão de bens e serviço não sujeita', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M04', description: 'IVA - Regime de Exclusão', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M11', description: 'Isento Artigo 12.º (b) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M12', description: 'Isento Artigo 12.º (c) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M13', description: 'Isento Artigo 12.º (d) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M14', description: 'Isento Artigo 12.º (e) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M15', description: 'Isento Artigo 12.º (f) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M17', description: 'Isento Artigo 12.º (h) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M18', description: 'Isento Artigo 12.º (i) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M19', description: 'Isento Artigo 12.º (j) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M20', description: 'Isento Artigo 12.º (k) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M30', description: 'Isento Artigo 15.º 1 (a) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M31', description: 'Isento Artigo 15.º 1 (b) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M32', description: 'Isento Artigo 15.º 1 (c) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M33', description: 'Isento Artigo 15.º 1 (d) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M34', description: 'Isento Artigo 15.º 1 (e) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M35', description: 'Isento Artigo 15.º 1 (f) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M36', description: 'Isento Artigo 15.º 1 (g) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M37', description: 'Isento Artigo 15.º 1 (h) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
        { code: 'M38', description: 'Isento Artigo 15.º 1 (i) do CIVA', is_active: true, created_at: new Date(), updated_at: null },
      ])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
