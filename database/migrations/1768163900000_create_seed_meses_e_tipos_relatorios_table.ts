import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'seed_meses_e_tipos_relatorios'

  async up() {
    // Inserir meses
    await this.db.table('meses').multiInsert([
      { id: 1, nome: 'Janeiro' },
      { id: 2, nome: 'Fevereiro' },
      { id: 3, nome: 'Março' },
      { id: 4, nome: 'Abril' },
      { id: 5, nome: 'Maio' },
      { id: 6, nome: 'Junho' },
      { id: 7, nome: 'Julho' },
      { id: 8, nome: 'Agosto' },
      { id: 9, nome: 'Setembro' },
      { id: 10, nome: 'Outubro' },
      { id: 11, nome: 'Novembro' },
      { id: 12, nome: 'Dezembro' }
    ])

    // Inserir tipos de relatório
    await this.db.table('tipos_relatorios').multiInsert([
      { id: 1, nome: 'IRT - Mapa Mensal' },
      { id: 2, nome: 'IRT Modelo 2_Anexo - Anual' },
      { id: 3, nome: 'Segurança Social - Mensal' },
      { id: 4, nome: 'IRT - GRUPO B - Mensal' },
      { id: 5, nome: 'Modelo PSX' }
    ])
  }

  async down() {
    await this.db.rawQuery('TRUNCATE TABLE meses')
    await this.db.rawQuery('TRUNCATE TABLE tipos_relatorios')
  }
}