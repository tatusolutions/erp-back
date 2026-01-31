import MapaDeTaxas from '../models/MapaDeTaxas.js'

export class MapaDeTaxasService {
  /**
   * Busca todas as taxas
   */
  static async getAll() {
    return await MapaDeTaxas.query().orderBy('id', 'asc')
  }

  /**
   * Busca apenas taxas ativas
   */
  static async getActive() {
    return await MapaDeTaxas.query()
      .where('status', 'activo')
      .orderBy('id', 'asc')
  }

  /**
   * Busca taxa por ID
   */
  static async getById(id: number) {
    return await MapaDeTaxas.find(id)
  }

  /**
   * Calcula as contribuições da Segurança Social
   */
  static async calcularSS(salario: number) {
    const taxas = await this.getActive()
    
    if (taxas.length === 0) {
      return {
        ssTotal: 0,
        ssEmpresa: 0,
        ssTrabalhador: 0,
        erro: 'Nenhuma taxa de SS encontrada'
      }
    }

    const taxaAtual = taxas[0] // Pega a primeira taxa ativa

    const ssEmpresa = salario * taxaAtual.ssEmpresa / 100
    const ssTrabalhador = salario * taxaAtual.ssTrabalhador / 100
    const ssTotal = ssEmpresa + ssTrabalhador

    return {
      ssTotal: Math.round(ssTotal * 100) / 100,
      ssEmpresa: Math.round(ssEmpresa * 100) / 100,
      ssTrabalhador: Math.round(ssTrabalhador * 100) / 100,
      taxaAplicada: taxaAtual,
      salario: salario
    }
  }

  /**
   * Calcula o salário líquido após desconto de SS
   */
  static async calcularSalarioLiquido(salarioBruto: number) {
    const ssCalculo = await this.calcularSS(salarioBruto)
    
    if (ssCalculo.erro) {
      return {
        salarioLiquido: salarioBruto,
        descontoSS: 0,
        ...ssCalculo
      }
    }

    const salarioLiquido = salarioBruto - ssCalculo.ssTrabalhador

    return {
      salarioLiquido: Math.round(salarioLiquido * 100) / 100,
      salarioBruto: salarioBruto,
      descontoSS: ssCalculo.ssTrabalhador,
      contribuicaoEmpresa: ssCalculo.ssEmpresa,
      contribuicaoTotal: ssCalculo.ssTotal,
      taxaAplicada: ssCalculo.taxaAplicada
    }
  }

  /**
   * Cria uma nova taxa
   */
  static async create(data: Partial<MapaDeTaxas>) {
    return await MapaDeTaxas.create(data)
  }

  /**
   * Atualiza uma taxa
   */
  static async update(id: number, data: Partial<MapaDeTaxas>) {
    const taxa = await MapaDeTaxas.find(id)
    if (!taxa) return null
    
    taxa.merge(data)
    await taxa.save()
    return taxa
  }

  /**
   * Remove uma taxa
   */
  static async delete(id: number) {
    const taxa = await MapaDeTaxas.find(id)
    if (!taxa) return false
    
    await taxa.delete()
    return true
  }

  /**
   * Ativa/Desativa uma taxa
   */
  static async toggleStatus(id: number) {
    const taxa = await MapaDeTaxas.find(id)
    if (!taxa) return null
    
    taxa.status = taxa.status === 'activo' ? 'inactivo' : 'activo'
    await taxa.save()
    return taxa
  }

  /**
   * Valida se as taxas são consistentes (soma = taxa total)
   */
  static validarTaxas(taxas: MapaDeTaxas[]) {
    const taxasInvalidas = taxas.filter(taxa => {
      const soma = taxa.ssEmpresa + taxa.ssTrabalhador
      return Math.abs(soma - taxa.ss) > 0.01 // Tolerância de 0.01 para arredondamento
    })

    return {
      valido: taxasInvalidas.length === 0,
      taxasInvalidas: taxasInvalidas,
      mensagem: taxasInvalidas.length === 0 
        ? 'Todas as taxas são válidas'
        : 'Existem taxas inconsistentes'
    }
  }
}
