import MapaIRT from '../models/MapaIRT.js'

export default class MapaIRTService {
  /**
   * Lista todos os escalões do mapa IRT
   */
  async getAll() {
    return await MapaIRT.query().orderBy('valor_de', 'asc')
  }

  /**
   * Lista todos os escalões (alias para getAll)
   */
  async list() {
    return await this.getAll()
  }

  /**
   * Busca apenas escalões ativos
   */
  async getActive() {
    return await MapaIRT.query()
      .where('status', 'activo')
      .orderBy('valor_de', 'asc')
  }

  /**
   * Busca escalão por ID
   */
  async getById(id: number) {
    return await MapaIRT.find(id)
  }

  /**
   * Busca escalão por valor de rendimento
   */
  async getByValor(valor: number) {
    return await MapaIRT.query()
      .where('valor_de', '<=', valor)
      .where('valor_ate', '>=', valor)
      .where('status', 'activo')
      .first()
  }

  /**
   * Calcula o imposto IRT com base no rendimento
   */
  async calcularIRT(rendimento: number) {
    const escalao = await this.getByValor(rendimento)
    
    if (!escalao) {
      return {
        imposto: 0,
        escalao: null,
        erro: 'Nenhum escalão encontrado para este rendimento'
      }
    }

    let imposto = 0

    if (escalao.nome === 'Até' && escalao.isento === 'isento') {
      // Isenção
      imposto = 0
    } else if (escalao.nome === 'De' || escalao.nome === 'Acima') {
      // Cálculo progressivo
      const excesso = rendimento - escalao.valorDe + 1
      imposto = escalao.valor + (excesso * escalao.percentagem / 100)
    } else {
      // Parcela fixa
      imposto = escalao.valor
    }

    return {
      imposto: Math.round(imposto * 100) / 100, // Arredonda para 2 casas decimais
      escalao: escalao,
      rendimento: rendimento
    }
  }

  /**
   * Cria um novo escalão
   */
  async create(data: Partial<MapaIRT>) {
    return await MapaIRT.create(data)
  }

  /**
   * Atualiza um escalão
   */
  async update(id: number, data: Partial<MapaIRT>) {
    const mapaIRT = await MapaIRT.find(id)
    if (!mapaIRT) return null
    
    mapaIRT.merge(data)
    await mapaIRT.save()
    return mapaIRT
  }

  /**
   * Remove um escalão
   */
  async delete(id: number) {
    const mapaIRT = await MapaIRT.find(id)
    if (!mapaIRT) return false
    
    await mapaIRT.delete()
    return true
  }

  /**
   * Ativa/Desativa um escalão
   */
  async toggleStatus(id: number) {
    const mapaIRT = await MapaIRT.find(id)
    if (!mapaIRT) return null
    
    mapaIRT.status = mapaIRT.status === 'activo' ? 'inactivo' : 'activo'
    await mapaIRT.save()
    return mapaIRT
  }
}
