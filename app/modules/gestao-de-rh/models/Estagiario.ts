import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Empresa from '../../empresas/models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'
import Departamento from './Departamento.js'
import Colaborador from './Colaborador.js'
import Projeto from './Projeto.js'

export default class Estagiario extends BaseModel {
  public static table = 'estagiarios'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_empresa: number | null

  @column()
  declare id_departamento: number | null

  @column()
  declare id_supervisor: number | null

  @column()
  declare id_projeto: number | null

  @column()
  declare user_id: number | null

  @column.date()
  declare data_nascimento: DateTime | null

  @column()
  declare adicionar_remuneracao: string | null

  @column()
  declare foto: string | null

  @column()
  declare nome: string

  @column()
  declare funcao: string | null

  @column()
  declare associar_projeto: string | null


  @column()
  declare bi: string

  @column.date()
  declare data_bi_validade: DateTime | null


  @column()
  declare sexo: string

  @column()
  declare estado_civil: string

  @column()
  declare nacionalidade: string

  @column()
  declare endereco: string

  @column()
  declare telefone_principal: string

  @column()
  declare telefone_alternativo: string | null

  @column()
  declare email: string | null

  @column()
  declare email_institucional: string | null

  @column()
  declare nss: string | null

  /* ===== Estágio ===== */

  @column()
  declare nivel_academico: string

  @column()
  declare curso: string

  @column()
  declare instituicao_ensino: string

  // This setter will be called when setting the 'instituicao' property
  set instituicao(value: string) {
    this.instituicao_ensino = value
  }

  // This getter will be called when accessing the 'instituicao' property
  get instituicao() {
    return this.instituicao_ensino
  }

  @column.date()
  declare data_inicio_estagio: DateTime | null

  @column.date()
  declare data_fim_estagio: DateTime | null

  @column()
  declare tipo_estagio: string

  @column()
  declare bolsa_auxilio: number | null

  @column()
  declare auxilio_transporte: number | null

  @column()
  declare auxilio_alimentacao: number | null

  @column()
  declare status_estagio: string

  @column()
  declare plano_atividades: string | null

  @column()
  declare avaliacao_desempenho: string | null

  @column()
  declare relatorio_final: string | null

  @column()
  declare certificado_emitido: boolean

  @column.date()
  declare data_emissao_certificado: DateTime | null

  /* ===== Documentação ===== */

  @column()
  declare declaracao_vinculo: string | null

  @column()
  declare termo_compromisso: string | null

  @column()
  declare plano_estagio_arquivo: string | null

  @column()
  declare relatorio_arquivo: string | null

  @column()
  declare certificado_arquivo: string | null

  /* ===== Observações ===== */

  @column()
  declare observacoes: string | null

  @column()
  declare status: string

  /* ===== Timestamps ===== */

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* ===== Relações ===== */

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare usuario: BelongsTo<typeof User>

  @belongsTo(() => Departamento, {
    foreignKey: 'id_departamento',
  })
  declare departamento: BelongsTo<typeof Departamento>

  @belongsTo(() => Colaborador, {
    foreignKey: 'id_supervisor',
  })
  declare supervisor: BelongsTo<typeof Colaborador>

  @belongsTo(() => Projeto, {
    foreignKey: 'id_projeto',
  })
  declare projeto: BelongsTo<typeof Projeto>
}
