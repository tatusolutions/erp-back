import { BaseModel, column, belongsTo, BelongsTo } from '@adonisjs/lucid/orm';
import type { BelongsTo as BelongsToType } from '@adonisjs/lucid/types/relations';
import Colaborador from '../modules/gestao-de-rh/models/Colaborador.js';
import User from './user.js';

export default class Falta extends BaseModel {
  @column({ isPrimary: true })
  public id: number;

  @column()
  public colaborador_id: number;

  @column()
  public data_inicio: string;

  @column()
  public data_fim: string;

  @column()
  public data_referencia: string;

  @column()
  public tipo: string;

  @column()
  public descricao: string | null;

  @column()
  public estado: string;

  @column()
  public duracao: number;

  @column()
  public motivo_rejeicao: string | null;

  @column()
  public aprovado_por: number | null;

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime;

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime;

  // Relacionamentos
  @belongsTo(() => Colaborador, {
    foreignKey: 'colaborador_id'
  })
  public colaborador: BelongsToType<typeof Colaborador>;

  @belongsTo(() => User, {
    foreignKey: 'aprovado_por'
  })
  public aprovador: BelongsToType<typeof User>;

  // Métodos estáticos para tipos
  public static readonly TIPOS = {
    FERIAS: 'ferias',
    LICENCA_MEDICA: 'licenca_medica',
    VIAGEM_TRABALHO: 'viagem_trabalho',
    HOME_OFFICE: 'home_office',
    TELETRABALHO: 'teletrabalho',
    FALTA_JUSTIFICADA: 'falta_justificada',
    FALTA_INJUSTIFICADA: 'falta_injustificada',
    LICENCA_MATERNIDADE: 'licenca_maternidade',
    LICENCA_PATERNIDADE: 'licenca_paternidade',
    FORMACAO: 'formacao',
    MISSAO_SERVICO: 'missao_servico',
    BAIXA_MEDICA: 'baixa_medica',
    LUTO: 'luto',
    DISPENSA: 'dispensa',
    OUTROS: 'outros'
  } as const;

  public static readonly ESTADOS = {
    PENDENTE: 'pendente',
    APROVADO: 'aprovado',
    REJEITADO: 'rejeitado'
  } as const;

  // Métodos de conveniência
  public getTipoLabel(): string {
    const labels = {
      ferias: 'Férias',
      licenca_medica: 'Licença Médica',
      viagem_trabalho: 'Viagem de Trabalho',
      home_office: 'Home Office',
      teletrabalho: 'Teletrabalho',
      falta_justificada: 'Falta Justificada',
      falta_injustificada: 'Falta Injustificada',
      licenca_maternidade: 'Licença de Maternidade',
      licenca_paternidade: 'Licença de Paternidade',
      formacao: 'Formação / Capacitação',
      missao_servico: 'Missão de Serviço',
      baixa_medica: 'Baixa Médica Prolongada',
      luto: 'Luto',
      dispensa: 'Dispensa Autorizada',
      outros: 'Outros'
    };
    return labels[this.tipo as keyof typeof labels] || this.tipo;
  }

  public getEstadoLabel(): string {
    const labels = {
      pendente: 'Pendente',
      aprovado: 'Aprovado',
      rejeitado: 'Rejeitado'
    };
    return labels[this.estado as keyof typeof labels] || this.estado;
  }

  public getCorTipo(): string {
    const cores = {
      ferias: 'warning',
      licenca_medica: 'info',
      viagem_trabalho: 'primary',
      home_office: 'success',
      teletrabalho: 'success',
      falta_justificada: 'secondary',
      falta_injustificada: 'danger',
      licenca_maternidade: 'pink',
      licenca_paternidade: 'purple',
      formacao: 'dark',
      missao_servico: 'primary',
      baixa_medica: 'info',
      luto: 'dark',
      dispensa: 'secondary',
      outros: 'secondary'
    };
    return cores[this.tipo as keyof typeof cores] || 'secondary';
  }

  public getCorEstado(): string {
    const cores = {
      pendente: 'warning',
      aprovado: 'success',
      rejeitado: 'danger'
    };
    return cores[this.estado as keyof typeof cores] || 'secondary';
  }

  // Método para calcular duração se não estiver definida
  public calcularDuracao(): number {
    if (this.duracao) {
      return this.duracao;
    }
    
    const inicio = new Date(this.data_inicio);
    const fim = new Date(this.data_fim);
    const diffTime = Math.abs(fim.getTime() - inicio.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  }

  // Método para verificar se pode ser aprovado
  public podeSerAprovado(): boolean {
    return this.estado === 'pendente';
  }

  // Método para verificar se pode ser rejeitado
  public podeSerRejeitado(): boolean {
    return this.estado === 'pendente';
  }

  // Método para aprovar
  public aprovar(aprovadoPor: number): void {
    this.estado = 'aprovado';
    this.aprovado_por = aprovadoPor;
  }

  // Método para rejeitar
  public rejeitar(aprovadoPor: number, motivo: string): void {
    this.estado = 'rejeitado';
    this.aprovado_por = aprovadoPor;
    this.motivo_rejeicao = motivo;
  }
}
