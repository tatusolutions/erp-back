import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'documentos'

  public async up() {
    // First, check if the table exists
    const hasTable = await this.schema.hasTable(this.tableName)

    if (!hasTable) {
      // Create the table if it doesn't exist
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id').primary()
        table.string('numero').notNullable()
        table.timestamp('data_criacao').notNullable()
        table.timestamp('data_vencimento').nullable()
        table.timestamp('data_emissao').nullable()
        table.timestamp('data_pagamento').nullable()
        table.string('motivo_emissao').nullable()
        table.integer('id_documento_original').unsigned().nullable()
        // Foreign keys - making id_modelo nullable and removing foreign key constraint for now
        table.integer('id_modelo').unsigned().nullable()
        table.integer('id_estabelecimento').unsigned().references('id').inTable('estabelecimentos')
        table.integer('id_tipo_documento').unsigned().references('id').inTable('tipo_documentos')
        table.integer('id_nome_documento').unsigned().references('id').inTable('nome_documentos')
        table.integer('id_cliente').unsigned().references('id').inTable('clientes')

        // Document details
        table.string('moeda').notNullable().defaultTo('AOA')
        table.integer('id_empresa').unsigned().references('id').inTable('empresas').nullable()
        table.text('observacoes').nullable()
        table.text('termos_condicoes').nullable()
        table.decimal('desconto_global', 10, 2).defaultTo(0)


        table.string('carregamento_data').nullable()
        table.string('carregamento_hora').nullable()
        table.string('carregamento_local').nullable()
        table.string('descarga_data').nullable()
        table.string('descarga_hora').nullable()
        table.string('descarga_local').nullable()

        // New fields
        table.string('hash').nullable()
        table.string('referencia').nullable()
        table.string('sigla').nullable()
        table.string('hash_control').nullable()
        table.decimal('gross_total', 15, 2).defaultTo(0)
        table.decimal('valor_por_pagar', 15, 2).defaultTo(0)
        table.decimal('valor_liquidado', 15, 2).defaultTo(0)
        table.decimal('valor_pendente', 15, 2).defaultTo(0)
        table.decimal('desconto_global_percentual', 10, 2).defaultTo(0)
        table.decimal('desconto_global_valor', 10, 2).defaultTo(0)

        // Status and totals
        table.string('estado').defaultTo('rascunho')
        table.decimal('total', 15, 2).defaultTo(0)
        table.decimal('desconto', 15, 2).defaultTo(0)
        table.decimal('total_final', 15, 2).defaultTo(0)

        // User who created the document
        table.integer('user_id').unsigned().references('id').inTable('users')

        // Timestamps
        table.timestamp('created_at', { useTz: true }).notNullable()
        table.timestamp('updated_at', { useTz: true }).notNullable()

        // Indexes
        table.index(['numero', 'id_empresa'], 'documentos_numero_empresa_index')
      })
    } else {
      // Table exists, just add the missing columns
      const columns = await this.db.rawQuery(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'documentos';
      `)

      const columnNames = columns[0].map((col: any) => col.COLUMN_NAME)

      if (!columnNames.includes('hash')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('hash').nullable()
        })
      }

      if (!columnNames.includes('referencia')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('referencia').nullable()
        })
      }

      if (!columnNames.includes('sigla')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('sigla').nullable()
        })
      }

      if (!columnNames.includes('carregamento_data')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('carregamento_data').nullable()
        })
      }

      if (!columnNames.includes('carregamento_hora')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('carregamento_hora').nullable()
        })
      }

      if (!columnNames.includes('carregamento_local')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('carregamento_local').nullable()
        })
      }

      if (!columnNames.includes('descarga_data')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('descarga_data').nullable()
        })
      }

      if (!columnNames.includes('descarga_hora')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('descarga_hora').nullable()
        })
      }

      if (!columnNames.includes('descarga_local')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('descarga_local').nullable()
        })
      } 

      if (!columnNames.includes('hash_control')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.string('hash_control').nullable()
        })
      }

      if (!columnNames.includes('gross_total')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.decimal('gross_total', 15, 2).defaultTo(0)
        })
      }

      if (!columnNames.includes('valor_por_pagar')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.decimal('valor_por_pagar', 15, 2).defaultTo(0)
        })
      }

      if (!columnNames.includes('valor_liquidado')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.decimal('valor_liquidado', 15, 2).defaultTo(0)
        })
      }

      if (!columnNames.includes('valor_pendente')) {
        await this.schema.alterTable(this.tableName, (table) => {
          table.decimal('valor_pendente', 15, 2).defaultTo(0)
        })
      }
    }
  }

  public async down() {
    // Be careful with this in production
    // this.schema.dropTable(this.tableName)
  }
}
