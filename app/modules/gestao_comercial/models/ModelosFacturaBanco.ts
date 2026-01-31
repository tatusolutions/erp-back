import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Banco from '../../form_control_geral/models/Banco.js'
import ModelosFactura from './ModelosFactura.js'

export default class ModelosFacturaBanco extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  modelos_factura_id!: number

  @column()
  banco_id!: number

  @column()
  abreviacao!: string 
  
  @belongsTo(() => Banco)
  banco!: BelongsTo<typeof Banco>

  @belongsTo(() => ModelosFactura)
  modelo!: BelongsTo<typeof ModelosFactura>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
