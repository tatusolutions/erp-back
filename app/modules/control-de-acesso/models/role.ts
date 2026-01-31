import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import PermissoesRole from './permissoes_role.js'

export default class Role extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  name!: string

  @column()
  slug!: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => PermissoesRole, {
    foreignKey: 'id_role',
    serializeAs: null, // Excluir permissões da serialização da role
  })
  permissoes!: HasMany<typeof PermissoesRole>
}
