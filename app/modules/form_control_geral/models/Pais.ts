import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Provincia from './Provincia.js'

export default class Pais extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  codigo!: string

  @hasMany(() => Provincia)
  provincias!: HasMany<typeof Provincia>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
