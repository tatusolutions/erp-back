import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo, ManyToMany } from '@adonisjs/lucid/types/relations'

import Banco from '../../form_control_geral/models/Banco.js'
import Empresa from '../../empresas/models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'

export default class ModelosFactura extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  nome!: string

  @column()
  nif!: string

  @column()
  telefone!: string

  @column()
  endereco!: string

  @column()
  logotipo!: string

  @column()
  email!: string

  @column()
  tem_banco!: boolean

  @column()
  tem_marca_d_agua!: boolean

  @column()
  status!: boolean

  @column()
  declare id_empresa: number

  @column()
  declare id_usuario: number

  @manyToMany(() => Banco, {
    pivotTable: 'modelos_faturas_bancos',
    pivotColumns: ['iban', 'n_conta'],
  })
  bancos!: ManyToMany<typeof Banco>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  empresa!: BelongsTo<typeof Empresa>

  @belongsTo(() => User, {
    foreignKey: 'id_usuario',
  })
  user!: BelongsTo<typeof User>
}
