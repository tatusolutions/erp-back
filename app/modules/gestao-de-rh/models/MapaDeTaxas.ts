import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'

export default class MapaDeTaxas extends BaseModel {
  @column({ isPrimary: true })
  public declare id: number

 
  @column()
  public declare ss: number

  @column()
  public declare ssEmpresa: number

  @column()
  public declare ssTrabalhador: number

  @column()
  public declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
