// database/migrations/1767808738104_add_faltas_to_folha_salario_table.ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class AddFaltasToFolhaSalario extends BaseSchema {
    protected tableName = 'folha_salario'

    public async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.integer('falta_justificada_qtd').nullable().after('observacoes')
            table.integer('faltas_nao_justificadas_qtd').nullable().after('falta_justificada_qtd')
            table.integer('total_faltas').nullable().after('faltas_nao_justificadas_qtd')
            table.decimal('falta_justificada_valor', 10, 2).nullable().after('total_faltas')
            table.decimal('faltas_nao_justificadas_valor', 10, 2).nullable().after('falta_justificada_valor')
            table.decimal('total_faltas_valor', 10, 2).nullable().after('faltas_nao_justificadas_valor')
        })
    }

    public async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('falta_justificada_qtd')
            table.dropColumn('faltas_nao_justificadas_qtd')
            table.dropColumn('total_faltas')
            table.dropColumn('falta_justificada_valor')
            table.dropColumn('faltas_nao_justificadas_valor')
            table.dropColumn('total_faltas_valor')
        })
    }
}