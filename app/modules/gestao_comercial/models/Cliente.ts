import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import GrupoPreco from './GrupoPreco.js'
import Municipio from '../../form_control_geral/models/Municipio.js'
import Provincia from '../../form_control_geral/models/Provincia.js'
import Empresa from './Empresa.js'

export default class Cliente extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare foto: string

  @column()
  declare telefone: string

  @column()
  declare nif: string

  @column()
  declare email: string

  @column()
  declare status_cativo: string

  @column()
  declare is_cativo: boolean

  @column()
  declare id_grupo_preco: number | null

  @column()
  declare is_retencao: boolean

  @column()
  declare is_grupo_preco: boolean

  @column()
  declare retencao: number | null

  @column()
  declare id_municipio: number | null

  @column()
  declare id_pais: number | null
 
  @column()
  declare id_provincia: number | null

  @column()
  declare endereco: string

  @column()
  declare estado: string

  @column()
  declare codigoPostal: string

  @column()
  declare id_empresa: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => GrupoPreco, {
    foreignKey: 'id_grupo_preco',
  })
  public grupoPreco!: BelongsTo<typeof GrupoPreco>

  @belongsTo(() => Municipio, {
    foreignKey: 'id_municipio',
  })
  public municipio!: BelongsTo<typeof Municipio>

  @belongsTo(() => Provincia, {
    foreignKey: 'id_provincia',
  })
  public provincia!: BelongsTo<typeof Provincia>

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  public empresa!: BelongsTo<typeof Empresa>
}
