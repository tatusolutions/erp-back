import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class TaxRegime extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  code!: string

  @column()
  description!: string

  @column()
  status!: string | boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
