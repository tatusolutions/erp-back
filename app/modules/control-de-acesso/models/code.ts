import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Code extends BaseModel {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public code!: string

  @column()
  public email!: string

  @column()
  public estado!: 'activo' | 'usado' | 'expirado'

  @column.dateTime({ autoCreate: true })   // auto-popula ao criar
  public createdAt!: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true }) // auto-popula ao criar/atualizar
  public updatedAt!: DateTime
}
