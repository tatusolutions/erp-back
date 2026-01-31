import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empresa from './../../empresas/models/Empresa.js'
import Colaborador from './Colaborador.js'
import User from './../../control-de-acesso/models/user.js'

export default class Declaracao extends BaseModel {
  public static table = 'declaracoes'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_empresa: number | null

  @column()
  declare id_colaborador: number | null

  @column()
  declare efeito: string

  @column()
  declare finalidade: string | null

  @column()
  declare estado: string

  @column()
  declare user_id: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
  
  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  public empresa!: BelongsTo<typeof Empresa>

  @belongsTo(() => Colaborador, {
    foreignKey: 'id_colaborador',
  })
  public colaborador!: BelongsTo<typeof Colaborador>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  public user!: BelongsTo<typeof User>
}
