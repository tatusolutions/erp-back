import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Prestador from './Prestador.js'
import User from '#models/user'
import Empresa from '../../empresas/models/Empresa.js'

export default class PrestadorPagamento extends BaseModel {
  public static table = 'prestador_pagamentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare prestador_id: number

  @column()
  declare ano: number

  @column()
  declare mes: number

  @column()
  declare valor: number

  @column.dateTime()
  declare data_pagamento: DateTime

  @column()
  declare observacoes: string | null

  @column()
  declare status: string

  @column()
  declare empresa_id: number

  @column()
  declare usuario_id: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relação com Prestador
  @belongsTo(() => Prestador, {
    foreignKey: 'prestador_id',
  })
  declare prestador: BelongsTo<typeof Prestador>

  @belongsTo(() => Empresa, {
    foreignKey: 'empresa_id',
  })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => User, {
    foreignKey: 'usuario_id',
  })
  declare usuario: BelongsTo<typeof User>
}
