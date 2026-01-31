import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Empresa from '../../empresas/models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'
import Departamento from './Departamento.js'
import Colaborador from './Colaborador.js'

export default class Projeto extends BaseModel {
  public static table = 'projetos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_empresa: number | null

  @column()
  declare id_departamento: number | null

  @column()
  declare id_gestor: number | null

  @column()
  declare responsavel: string | null

  @column()
  declare nome: string

  @column()
  declare descricao: string | null

  @column()
  declare codigo: string | null

  @column()
  declare status: string

  @column()
  declare prioridade: string

  @column.date()
  declare data_inicio: DateTime | null

  @column.date()
  declare data_fim_prevista: DateTime | null

  @column.date()
  declare data_fim_real: DateTime | null

  @column()
  declare orcamento: number | null

  @column()
  declare custo_atual: number | null

  @column()
  declare custo_real: number | null

  @column()
  declare progresso: number

  @column()
  declare tipo: string | null

  @column()
  declare cliente: string | null

  @column()
  declare localizacao: string | null

  @column()
  declare observacoes: string | null

  @column()
  declare requer_aprovacao: boolean

  @column()
  declare aprovado_por: number | null

  @column.date()
  declare data_aprovacao: DateTime | null

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

  @belongsTo(() => Departamento, {
    foreignKey: 'id_departamento',
  })
  declare departamento: BelongsTo<typeof Departamento>

  @belongsTo(() => Colaborador, {
    foreignKey: 'id_gestor',
  })
  declare gestor: BelongsTo<typeof Colaborador>

  @belongsTo(() => User, {
    foreignKey: 'aprovado_por',
  })
  declare aprovadoPor: BelongsTo<typeof User>
}
