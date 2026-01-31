import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Modulo from './modulo.js'
import Permissoe from './permissoe.js'

export default class ModulosPermissoe extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  id_permissao!: number

  @column()
  id_modulo!: number

  @belongsTo(() => Modulo)
  modulo!: BelongsTo<typeof Modulo>

  @belongsTo(() => Permissoe)
  permissao!: BelongsTo<typeof Permissoe>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
