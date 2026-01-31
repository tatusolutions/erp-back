import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'

import TipoDeProduto from './TiposDeProduto.js'
import Empresa from './Empresa.js'
import LinhaRegime from './LinhasRegime.js'
import Marca from './Marca.js'
import Variacoe from './Variacoe.js'
import Categoria from './Categoria.js'
import TaxRegime from './TaxRegime.js'

export default class Produto extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  logotipo?: string

  @column()
  id_tipo_produto?: number

  @belongsTo(() => TipoDeProduto, { foreignKey: 'id_tipo_produto' })
  tipoProduto!: BelongsTo<typeof TipoDeProduto>

  @column()
  id_empresa!: number

  @belongsTo(() => Empresa, { foreignKey: 'id_empresa' })
  empresa!: BelongsTo<typeof Empresa>

  @column()
  referencia?: string

  @column()
  id_linhas_regime?: number

  @belongsTo(() => LinhaRegime, { foreignKey: 'id_linhas_regime' })
  linhaRegime!: BelongsTo<typeof LinhaRegime>

  @column()
  iva_taxa?: number

  @column()
  custo?: number

  @column()
  precoCusto?: number

  @column()
  precoVenda?: number

  @column()
  pvp?: number

  @column()
  margem?: number

  @column()
  preco_com_iva?: number

  @column()
  temPrecoComIva!: boolean

  @column()
  temCategoria!: boolean

  @column()
  tem_variacao!: boolean

  @column()
  temMarca!: boolean

  @column()
  id_marca?: number

  @belongsTo(() => Marca, { foreignKey: 'id_marca' })
  marca!: BelongsTo<typeof Marca>

  @column()
  id_variacao?: number

  @belongsTo(() => Variacoe, { foreignKey: 'id_variacao' })
  variacao!: BelongsTo<typeof Variacoe>

  @column()
  id_categoria?: number

  @belongsTo(() => Categoria, { foreignKey: 'id_categoria' })
  categoria!: BelongsTo<typeof Categoria>

  @column()
  temEstoque!: boolean

  @column()
  estoque_armazem?: number   // <-- adicionado aqui

  @column()
  status?: string

  @column()
  motivo_regime?: string


  @hasOne(() => TaxRegime, {
    foreignKey: 'motivo_regime'
  })
  declare motivoRegime: HasOne<typeof TaxRegime>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
