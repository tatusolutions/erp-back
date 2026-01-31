import { DateTime } from 'luxon'
import { BaseModel, column, hasOne } from '@adonisjs/lucid/orm'
import type { HasOne } from '@adonisjs/lucid/types/relations'
import Armazen from './Armazen.js'

export default class Loja extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nome: string

  @column()
  declare serie: string | null

  @column()
  declare endereco: string

  @column()
  declare telefone: string

  @column()
  declare idEmpresa: number

  @column()
  declare isVinculadoArmazem: boolean

  @column()
  declare idArmazem: number | null

  @column()
  declare estado: 'ativa' | 'inativa' | 'fechada_temporariamente' | 'em_manutencao'

  @hasOne(() => Armazen, {
    foreignKey: 'id',
    localKey: 'idArmazem'
  })
  declare armazem: HasOne<typeof Armazen>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
