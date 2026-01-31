import { BaseSeeder } from '@adonisjs/lucid/seeders'
export default class MapaIRTSeeder extends BaseSeeder {
  // @ts-ignore - db is provided by the BaseSeeder at runtime
  declare db: any
  
  async run() {
    // Limpar dados existentes
    await this.db.query().from('mapa_irt').delete()

    // Dados do IRT Angola (valores em AOA) - dados reais do banco
    const dadosIRT = [
      {
        nome: 'Até',
        valor_de: 0,
        valor_ate: 100000,
        parcela: 'Parcela Fixa',
        valor: 0,
        percentagem: 0,
        isento: 'isento',
        total: 0,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 100001,
        valor_ate: 150000,
        parcela: 'Parcela Fixa',
        valor: 0,
        percentagem: 0.13,
        isento: 'sobre excesso de',
        total: 100001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 150001,
        valor_ate: 200000,
        parcela: 'Parcela Fixa',
        valor: 12500,
        percentagem: 0.16,
        isento: 'sobre excesso de',
        total: 150001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 200001,
        valor_ate: 300000,
        parcela: 'Parcela Fixa',
        valor: 31250,
        percentagem: 0.18,
        isento: 'sobre excesso de',
        total: 200001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 300001,
        valor_ate: 500000,
        parcela: 'Parcela Fixa',
        valor: 49250,
        percentagem: 0.19,
        isento: 'sobre excesso de',
        total: 300001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 500001,
        valor_ate: 1000000,
        parcela: 'Parcela Fixa',
        valor: 87250,
        percentagem: 0.20,
        isento: 'sobre excesso de',
        total: 500001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 1000001,
        valor_ate: 1500000,
        parcela: 'Parcela Fixa',
        valor: 187249,
        percentagem: 0.21,
        isento: 'sobre excesso de',
        total: 1000001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 1500001,
        valor_ate: 2000000,
        parcela: 'Parcela Fixa',
        valor: 292249,
        percentagem: 0.22,
        isento: 'sobre excesso de',
        total: 1500001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 2000001,
        valor_ate: 2500000,
        parcela: 'Parcela Fixa',
        valor: 402249,
        percentagem: 0.23,
        isento: 'sobre excesso de',
        total: 2000001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 2500001,
        valor_ate: 5000000,
        parcela: 'Parcela Fixa',
        valor: 517249,
        percentagem: 0.24,
        isento: 'sobre excesso de',
        total: 2500001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'De',
        valor_de: 5000001,
        valor_ate: 10000000,
        parcela: 'Parcela Fixa',
        valor: 1117249,
        percentagem: 0.24,
        isento: 'sobre excesso de',
        total: 5000001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nome: 'Acima',
        valor_de: 10000001,
        valor_ate: 9999999999,
        parcela: 'Parcela Fixa',
        valor: 2342249,
        percentagem: 0.25,
        isento: 'sobre excesso de',
        total: 10000001,
        status: 'activo',
        created_at: new Date(),
        updated_at: new Date()
      }
    ]

    // Inserir dados na tabela
    await this.db.table('mapa_irt').multiInsert(dadosIRT)
    
    console.log('✅ MapaIRT seeder executado com sucesso!')
    console.log(`📊 Foram inseridos ${dadosIRT.length} escalões de IRT`)
  }
}
