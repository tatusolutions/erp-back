import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class MapaIRT extends BaseModel {
  public static table = 'mapa_irt'
  
  @column({ isPrimary: true })
  public declare id: number

  @column()
  public declare nome: string

  @column({ columnName: 'valor_de' })
  public declare valorDe: number

  @column({ columnName: 'valor_ate' })
  public declare valorAte: number

  @column()
  public declare parcela: string


  @column({ columnName: 'percentagem' })
  public declare percentagem: number

  @column({ columnName: 'valor' })
  public declare valor: number

  @column({ columnName: 'isento' })
  public declare isento: string | null

  @column()
  public declare total: number

  @column()
  public declare status: string

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  public declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  public declare updatedAt: DateTime
}