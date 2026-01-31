import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Colaborador from './Colaborador.js'
import TipoAnexo from './TipoAnexo.js'
import User from '../../control-de-acesso/models/user.js'

export default class ColaboradorDocumento extends BaseModel {
  public static table = 'colaborador_documentos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_colaborador: number

  @column()
  declare id_tipo_documento: number | null

  @column()
  declare user_id: number | null

  @column()
  declare titulo: string

  @column()
  declare descricao: string | null

  @column()
  declare ficheiro: string

  @column()
  declare ficheiro_original: string

  @column()
  declare mime_type: string | null

  @column()
  declare tamanho_ficheiro: number | null

  @column.date()
  declare data_emissao: DateTime | null

  @column.date()
  declare data_validade: DateTime | null

  @column()
  declare estado: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* ===== Relações ===== */

  @belongsTo(() => Colaborador, {
    foreignKey: 'id_colaborador',
  })
  declare colaborador: BelongsTo<typeof Colaborador>

  @belongsTo(() => TipoAnexo, {
    foreignKey: 'id_tipo_documento',
  })
  declare tipoDocumento: BelongsTo<typeof TipoAnexo>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare usuario: BelongsTo<typeof User>
}
