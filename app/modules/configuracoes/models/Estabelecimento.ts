import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Estabelecimento extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  serie?: string

  @column()
  estado?: string

  @column()
  endereco?: string

  @column()
  telefone?: string

  @column()
  id_empresa!: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
