import { DateTime } from 'luxon'
import { BaseModel, column, manyToMany } from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Permissoe from './permissoe.js'

export default class Modulo extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  name!: string

  @column()
  slug!: string

  @manyToMany(() => Permissoe, {
    pivotTable: 'modulos_permissoes',
    pivotForeignKey: 'id_modulo',
    pivotRelatedForeignKey: 'id_permissao',
  })
  permissoes!: ManyToMany<typeof Permissoe>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
