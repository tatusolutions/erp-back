import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Variacoe extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  idEmpresa!: number

  @column()
  status!: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
