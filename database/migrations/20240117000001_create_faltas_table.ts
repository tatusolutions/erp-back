import { BaseSchema } from '@adonisjs/lucid/schema';

export default class extends BaseSchema {
  protected tableName = 'faltas';

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary();
      
      // Relacionamento com colaborador
      table.integer('colaborador_id').unsigned().references('id').inTable('colaboradores').onDelete('CASCADE');
      
      // Datas do período de ausência
      table.date('data_inicio').notNullable();
      table.date('data_fim').notNullable();
      table.date('data_referencia').notNullable().comment('Data original selecionada no calendário');
      
      // Informações da ausência
      table.enum('tipo', [
        'ferias',
        'aniversario',
        'licenca_medica',
        'viagem_trabalho',
        'home_office',
        'teletrabalho',
        'falta_justificada',
        'falta_injustificada',
        'licenca_maternidade',
        'licenca_paternidade',
        'formacao',
        'missao_servico',
        'baixa_medica',
        'luto',
        'dispensa',
        'outros'
      ]).notNullable();
      
      table.text('descricao').nullable().comment('Descrição ou observações sobre a ausência');
      
      // Estado e aprovação
      table.enum('estado', ['pendente', 'aprovado', 'rejeitado']).defaultTo('pendente').notNullable();
      table.integer('aprovado_por').unsigned().references('id').inTable('users').onDelete('SET NULL').nullable();
      table.text('motivo_rejeicao').nullable().comment('Motivo da rejeição quando aplicável');
      
      // Duração em dias
      table.integer('duracao').notNullable().defaultTo(1).comment('Duração em dias do período de ausência');
      
      // Timestamps
      table.timestamp('created_at', { useTz: true }).defaultTo(this.now());
      table.timestamp('updated_at', { useTz: true }).defaultTo(this.now());
      
      // Índices para performance
      table.index(['colaborador_id']);
      table.index(['data_inicio', 'data_fim']);
      table.index(['estado']);
      table.index(['tipo']);
      table.index(['created_at']);
      
      // Índices compostos para consultas comuns
      table.index(['colaborador_id', 'estado']);
      table.index(['estado', 'data_inicio']);
      table.index(['tipo', 'data_inicio']);
    });
  }

  public async down() {
    this.schema.dropTable(this.tableName);
  }
}
