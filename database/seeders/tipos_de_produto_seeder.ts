import { BaseSeeder } from '@adonisjs/lucid/seeders'
export default class TiposDeProdutoSeeder extends BaseSeeder {
  // @ts-ignore - db is provided by the BaseSeeder at runtime
  declare db: any
  public async run() {
    await this.db.table('tipos_de_produtos').multiInsert([
      {
        id: 1,
        nome: 'Matéria-prima',
        descricao: 'Materiais básicos utilizados na produção de outros produtos',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        nome: 'Mercadoria',
        descricao: 'Produtos prontos para venda',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        nome: 'Serviço',
        descricao: 'Prestação de serviços diversos',
        created_at: new Date(),
        updated_at: new Date()
      }
    ])
  }
}