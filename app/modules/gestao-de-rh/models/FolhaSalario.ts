import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Colaborador from './Colaborador.js'

export default class FolhaSalario extends BaseModel {
  public static table = 'folha_salario'

  @column({ isPrimary: true })
  public declare id: number

  @column({ columnName: 'id_colaborador' })
  public declare id_colaborador: number

  @column({ columnName: 'nome_funcionario' })
  public declare nome_funcionario: string

  @column()
  public declare ano: number

  @column()
  public declare observacoes: string | null

  @column()
  public declare falta_justificada_qtd: number | null
  @column()
  public declare faltas_nao_justificadas_qtd: number | null
  @column()
  public declare total_faltas: number | null
  @column()
  public declare falta_justificada_valor: number | null
  @column()
  public declare faltas_nao_justificadas_valor: number | null
  @column()
  public declare total_faltas_valor: number | null

  @column()
  public declare mes: number

  /* ===== Remuneração ===== */

  @column()
  declare salario_base: number | null

  @column()
  declare total_subsidios: number | null

  @column()
  declare total_bruto: number | null

  @column()
  declare horas_extras: number | null

  @column()
  declare bonus: number | null

  @column()
  declare premios: number | null

  @column()
  declare outros_subsidios: number | null

  @column()
  declare adicionar_remuneracao: boolean

  /* ===== Subsídios ===== */

  @column()
  declare subsidio_alimentacao: number | null

  @column()
  declare subsidio_transporte: number | null

  @column()
  declare subsidio_noturno: number | null

  @column()
  declare subsidio_de_turno: number | null

  @column()
  declare subsidio_de_risco: number | null

  @column()
  declare subsidio_de_representacao: number | null

  @column()
  declare subsidio_de_regencia: number | null

  @column()
  declare subsidio_de_renda: number | null

  @column()
  declare subsidio_de_disponibilidade: number | null

  @column()
  declare subsidio_de_exame: number | null

  @column()
  declare subsidio_de_atavio: number | null

  @column()
  declare subsidio_de_ferias: number | null

  @column()
  declare subsidio_de_natal: string | null

  @column()
  declare abono_familia: number | null

  @column()
  declare abono_para_falhas: number | null

  @column()
  public declare subsidios: number

  @column()
  public declare ss: number

  @column()
  public declare irt: number

  @column({ columnName: 'outros_descontos' })
  public declare outros_descontos: number

  @column()
  public declare liquido: number

  @column({ columnName: 'mc_ss' })
  public declare mc_ss: number

  @column({ columnName: 'mc_irt' })
  public declare mc_irt: number

  @column({ columnName: 'data_referencia' })
  public declare data_referencia: DateTime

  @column()
  public declare status: string

  @belongsTo(() => Colaborador, {
    foreignKey: 'id_colaborador'
  })
  public declare colaborador: BelongsTo<typeof Colaborador>
}
