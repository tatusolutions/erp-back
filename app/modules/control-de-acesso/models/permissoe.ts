import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import PermissaoRole from './permissoes_role.js'
import ModulosPermissoe from './modulos_permissoe.js'
import type { HasMany } from '@adonisjs/lucid/types/relations'

export default class Permissoe extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  name?: string

  @column()
  slug?: string

  @hasMany(() => PermissaoRole)
  permissoesRoles!: HasMany<typeof PermissaoRole>

  @hasMany(() => ModulosPermissoe)
  modulosPermissoes!: HasMany<typeof ModulosPermissoe>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
