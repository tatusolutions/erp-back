import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Permissoe from './permissoe.js'
import Role from './role.js'

export default class PermissoesRole extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_role: number

  @column({ columnName: 'id_permissao' })
  declare idPermissao: number

  @belongsTo(() => Role, {
    foreignKey: 'id_role',
  })
  role!: BelongsTo<typeof Role>

  @belongsTo(() => Permissoe, {
    foreignKey: 'idPermissao',
  })
  permissao!: BelongsTo<typeof Permissoe>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
