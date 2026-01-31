import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Produto from './Produto.js'
import Armazen from '../../../modules/configuracoes/models/Armazen.js'
import Empresa from '../../empresas/models/Empresa.js'

export default class ProdutosArmazem extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_empresa: number

  @column()
  declare id_produto: number

  @column()
  declare id_armazem: number

  @column()
  declare quantidade: number

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  public empresa!: BelongsTo<typeof Empresa>

  @belongsTo(() => Produto, {
    foreignKey: 'id_produto',
  })
  public produto!: BelongsTo<typeof Produto>

  @belongsTo(() => Armazen, {
    foreignKey: 'id_armazem',
  })
  public armazen!: BelongsTo<typeof Armazen>
}
