import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TipoDocumento from './TipoDocumento.js'

export default class NomeDocumento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  abreviacao!: string

  @column()
  nome!: string

  @column()
  estado!: string

  @column()
  hexadecimal!: string

  @column()
  id_tipo_documento!: number

  @belongsTo(() => TipoDocumento)
  tipo_documento!: BelongsTo<typeof TipoDocumento>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
