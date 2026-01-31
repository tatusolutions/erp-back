import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

// Importe os modelos relacionados
import Municipio from '../../form_control_geral/models/Municipio.js'
import Moeda from '../../form_control_geral/models/Moeda.js'

export default class Empresa extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome_comercial!: string

  @column()
  nome_conservatoria?: string | null

  @column()
  capital_social?: number | null

  @column()
  email?: string | null

  @column()
  segurancaSocial?: string | null

  @column()
  nif?: string | null

  @column()
  nss?: string | null

  @column()
  dias_uteis?: string | null

  @column()
  fax?: string | null

  @column()
  telefone?: string | null

  @column()
  endereco?: string | null

  @column()
  website?: string | null

  @column({ columnName: 'id_municipio' })
  id_municipio!: number

  @column({ columnName: 'id_moeda' })
  id_moeda!: number

  @column()
  status: boolean = true

  @column()
  public logotipo?: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /**
   * Relação com Município
   */
  @belongsTo(() => Municipio, {
    foreignKey: 'id_municipio',
  })
  municipio!: BelongsTo<typeof Municipio>

  /**
   * Relação com Moeda
   */
  @belongsTo(() => Moeda, {
    foreignKey: 'id_moeda',
  })
  moeda!: BelongsTo<typeof Moeda>
}
