import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import ModelosFactura from './ModelosFactura.js'
import Banco from '../../form_control_geral/models/Banco.js'

export default class ModeloFaturaBanco extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare banco_id: number

  @column()
  declare nome: string

  @column()
  declare modelos_factura_id: number

  @column()
  declare iban: string | null

  @column()
  declare n_conta: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Banco, {
    foreignKey: 'banco_id',
  })
  declare banco: BelongsTo<typeof Banco>

  @belongsTo(() => ModelosFactura, {
    foreignKey: 'modelos_factura_id',
  })
  declare modeloFactura: BelongsTo<typeof ModelosFactura>
}
