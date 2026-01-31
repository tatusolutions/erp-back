import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Empresa from '../../empresas/models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'
import Departamento from '../models/Departamento.js'
import Falta from '../../../models/falta.js'
import ColaboradorDocumento from './ColaboradorDocumento.js'

export default class Colaborador extends BaseModel {
  public static table = 'colaboradores'

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
  declare foto: string | null

  @column()
  declare nome: string

  @column()
  declare bi: string

  @column.date()
  declare data_bi_validade: DateTime

  @column.date()
  declare data_nascimento: DateTime

  @column.date()
  declare data_vinculo: DateTime

  @column()
  declare sexo: string

  @column()
  declare estado_civil: string

  @column()
  declare estado: string

  @column()
  declare endereco: string

  @column()
  declare telefone_principal: string

  @column()
  declare telefone_alternativo: string | null

  @column()
  declare email: string | null

  @column()
  declare nss: string | null

  @column()
  declare tipo_pagamento: string | null

  @column()
  declare iban: string | null

  @column()
  declare id_banco: number | null

  @column()
  declare numero_conta: string | null

  /* ===== Remuneração ===== */

  @column()
  declare salario_base: number | null

  @column()
  declare total_base: number | null

  @column()
  declare total_subsidios: number | null

  @column()
  declare total_bruto: number | null

  @column()
  declare horas_extras: number | null

  @column()
  declare bonus: number | null

  @column()
  declare premios: number | null

  @column()
  declare outros_subsidios: number | null

  @column()
  declare adicionar_remuneracao: boolean

  /* ===== Subsídios ===== */

  @column()
  declare subsidio_alimentacao: number | null

  @column()
  declare subsidio_transporte: number | null

  @column()
  declare subsidio_noturno: number | null

  @column()
  declare subsidio_de_turno: number | null

  @column()
  declare subsidio_de_risco: number | null

  @column()
  declare subsidio_de_representacao: number | null

  @column()
  declare subsidio_de_regencia: number | null

  @column()
  declare subsidio_de_renda: number | null

  @column()
  declare subsidio_de_disponibilidade: number | null

  @column()
  declare subsidio_de_exame: number | null

  @column()
  declare subsidio_de_atavio: number | null

  @column()
  declare subsidio_de_ferias: number | null

  @column()
  declare subsidio_de_natal: string | null

  @column()
  declare abono_familia: number | null

  @column()
  declare abono_para_falhas: number | null

  /* ===== Timestamps ===== */

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  /* ===== Relações ===== */

  @belongsTo(() => Empresa, {
    foreignKey: 'id_empresa',
  })
  declare empresa: BelongsTo<typeof Empresa>

  @belongsTo(() => User, {
    foreignKey: 'user_id',
  })
  declare usuario: BelongsTo<typeof User>


  @belongsTo(() => Departamento, {
    foreignKey: 'id_departamento',
  })
  declare departamento: BelongsTo<typeof Departamento>

  @hasMany(() => Falta, {
    foreignKey: 'colaborador_id',
  })
  declare faltas: HasMany<typeof Falta>

  @hasMany(() => ColaboradorDocumento, {
    foreignKey: 'id_colaborador',
  })
  declare documentos: HasMany<typeof ColaboradorDocumento>

  
}
