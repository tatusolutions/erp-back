import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Pais from './Pais.js'
import Municipio from './Municipio.js'

export default class Provincia extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  idPais!: number

  @belongsTo(() => Pais)
  pais!: BelongsTo<typeof Pais>

  @hasMany(() => Municipio)
  municipios!: HasMany<typeof Municipio>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
