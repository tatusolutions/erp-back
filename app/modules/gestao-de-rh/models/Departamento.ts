import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Empresa from './../../empresas/models/Empresa.js'

export default class Departamento extends BaseModel {
  public static table = 'departamentos'
  @column({ isPrimary: true })
  declare id: number

  @column({  columnName: 'nome_departamento' })
  declare nomeDepartamento: string
 

  @column({ columnName: 'chef_departamento' })
  declare chefDepartamento: string | null

  @column()
  declare id_empresa: number | null

  @column()
  declare estado: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime 
  
    @belongsTo(() => Empresa, {
      foreignKey: 'id_empresa',
    })
    public empresa!: BelongsTo<typeof Empresa>
}
