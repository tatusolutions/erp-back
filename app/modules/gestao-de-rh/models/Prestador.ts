import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empresa from '../../empresas/models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'
import Departamento from '../models/Departamento.js'
import Profissao from '../models/Profissao.js'

export default class Prestador extends BaseModel {
  public static table = 'prestadores'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare id_empresa: number | null  

  @column()
  declare id_departamento: number | null

  @column()
  declare id_cargo: number | null

  @column()
  declare id_estabelecimento: number | null

  @column()
  declare user_id: number | null

  @column()
  declare nome: string

  @column()
  declare tipo_grupo: string

  @column()
  declare nif: string

  @column()
  declare telefone: string

  @column()
  declare telefone_alternativo: string | null

  @column()
  declare email: string

  @column()
  declare endereco: string

  @column()
  declare estado: string

  @column()
  declare tipo_pagamento: string

  @column()
  declare id_banco: number | null

  @column()
  declare numero_conta: string | null

  @column()
  declare iban: string | null

  @column()
  declare valor_pagamento: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  // Relações
  @belongsTo(() => Empresa, { foreignKey: 'id_empresa' })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => User, { foreignKey: 'user_id' })
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Departamento, { foreignKey: 'id_departamento' })
  declare departamento: BelongsTo<typeof Departamento>

  @belongsTo(() => Profissao, { foreignKey: 'id_cargo' })
  declare profissao: BelongsTo<typeof Profissao>
}
