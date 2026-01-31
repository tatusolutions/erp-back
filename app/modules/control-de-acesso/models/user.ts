import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'
import Role from './role.js'
import Empresa from '../../empresas/models/Empresa.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  public id!: number

  @column()
  public name!: string

  @column()
  public bi?: string

  @column()
  public morada?: string

  @column()
  public email?: string

  @column()
  public username?: string

  @column({ serializeAs: null })
  public password!: string

  @column()
  public imagem_perfil?: string

  @column()
  public sexo?: string

  @column()
  public data_nascimento?: DateTime

  @column()
  public telefone?: string

  @column()
  public activo!: boolean

  @column({ columnName: 'empresa_id' })
  public empresaId?: number | null

  @column({ columnName: 'id_role' })
  public roleId?: number | null

  @column({ columnName: 'is_super_user' })
  public isSuperUser!: boolean

  @column({ columnName: 'is_hidden' })
  public isHidden!: boolean

  
  @belongsTo(() => Role, {
    foreignKey: 'roleId',
  })
  role!: BelongsTo<typeof Role>

  @belongsTo(() => Empresa)
  empresa!: BelongsTo<typeof Empresa>


  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Hook beforeSave removido porque o withAuthFinder já faz hash automático das passwords
  static accessTokens = DbAccessTokensProvider.forModel(User)
}
