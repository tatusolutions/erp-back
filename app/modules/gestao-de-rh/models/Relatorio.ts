import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empresa from '../../empresas/models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'

export default class Relatorio extends BaseModel {
  public static table = 'relatorios'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_tipo_folha: number

  @column()
  declare ano: number

  @column()
  declare mes: number

  @column()
  declare id_empresa: number | null

  @column()
  declare id_usuario: number | null

  @column()
  declare nome_arquivo: string | null

  @column()
  declare caminho_arquivo: string | null

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* Relações */

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => User, {
    foreignKey: 'id_usuario',
  })
  declare usuario: BelongsTo<typeof User>
}
