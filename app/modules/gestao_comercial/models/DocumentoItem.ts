import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import Documento from './Documento.js'
import Empresa from '../../empresas/models/Empresa.js'
import Produto from './Produto.js'

export default class DocumentoItem extends BaseModel {
  public static table = 'documento_itens'
  public static snakeCaseAttributes = true

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'documento_id' })
  declare documentoId: number

  @column({ columnName: 'id_empresa' })
  declare empresaId: number

  @column({ columnName: 'produto_id' })
  declare produtoId: number

  @column()
  declare descricao: string

  @column()
  declare quantidade: number

  @column({ columnName: 'preco_unitario' })
  declare precoUnitario: number

  @column()
  declare desconto: number

  @column({ columnName: 'desconto_fora' })
  declare descontoFora: string

  @column()
  declare iva: number

  @column()
  declare total: number

  @column({ columnName: 'data_criacao' })
  declare dataCriacao: DateTime

  @column({ columnName: 'unidade_medida' })
  declare unidadeMedida: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime

  // Relations
  @belongsTo(() => Documento, {
    foreignKey: 'documentoId'
  })
  declare documento: BelongsTo<typeof Documento>

  @belongsTo(() => Empresa, {
    foreignKey: 'empresaId'
  })
  declare empresa: BelongsTo<typeof Empresa>


  @hasOne(() => Produto, {
    foreignKey: 'produtoId'
  })
  declare produto: HasOne<typeof Produto>
}