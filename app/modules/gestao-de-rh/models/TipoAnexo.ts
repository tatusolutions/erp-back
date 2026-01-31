import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ColaboradorDocumento from './ColaboradorDocumento.js'

export default class TipoAnexo extends BaseModel {
  public static table = 'tipo_anexos'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare abreviacao: string

  @column()
  declare descricao: string | null

  @column()
  declare estado: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* ===== Relações ===== */

  @hasMany(() => ColaboradorDocumento, {
    foreignKey: 'id_tipo_documento',
  })
  declare documentos: HasMany<typeof ColaboradorDocumento>
}
