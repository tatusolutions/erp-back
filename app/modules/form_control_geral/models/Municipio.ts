import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Provincia from './Provincia.js'

export default class Municipio extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  idProvincia!: number

  @belongsTo(() => Provincia, {
    foreignKey: 'idProvincia',
  })
  provincia!: BelongsTo<typeof Provincia>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
