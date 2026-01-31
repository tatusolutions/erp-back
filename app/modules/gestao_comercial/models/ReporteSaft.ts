import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'
import Empresa from './Empresa.js'
import * as relations from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class ReporteSaft extends BaseModel {
  public static table = 'reporte_safts'

  @column({ isPrimary: true })
  declare id: number

  @column.dateTime({
    autoCreate: false,
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('yyyy-MM-dd HH:mm:ss') : value
    }
  })
  public dataInicio!: DateTime

  @column.dateTime({
    autoCreate: false,
    serialize: (value: DateTime | null) => {
      return value ? value.toFormat('yyyy-MM-dd HH:mm:ss') : value
    }
  })
  public dataFim!: DateTime

  @column()
  totalDocumentos!: number

  @column()
  estado!: 'pendente' | 'processando' | 'concluido' | 'falha'

  @column()
  caminhoArquivo!: string | null

  @column()
  erro!: string | null

  @column({ columnName: 'empresa_id' })
  declare empresaId: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column.dateTime({ autoCreate: true })
  createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  updatedAt!: DateTime

  // Relationships
  @belongsTo(() => Empresa, {
    foreignKey: 'empresaId',
    localKey: 'id'
  })
  empresa!: relations.BelongsTo<typeof Empresa>

  @belongsTo(() => User, {
    foreignKey: 'userId',
    localKey: 'id'
  })
  usuario!: relations.BelongsTo<typeof User>

  // Serialization
  serializeExtras() {
    return {
      ...this.$extras,
      data_inicio: this.dataInicio.toFormat('yyyy-MM-dd'),
      data_fim: this.dataFim.toFormat('yyyy-MM-dd'),
      created_at: this.createdAt.toFormat('dd/MM/yyyy HH:mm:ss'),
    }
  }
}