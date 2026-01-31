import type { HttpContext } from '@adonisjs/core/http'
import MapaIRTService from '../services/mapa_irt_service.js'

export default class MapaIRTController {
  constructor(private service = new MapaIRTService()) {}
  /**
   * Lista todos os escalões do mapa IRT
   */
  public async index({ response }: HttpContext) {
    try {
      const mapaIRT = await this.service.getAll()
      return response.json({
        success: true,
        data: mapaIRT
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar mapa IRT',
        error: error.message
      })
    }
  }

  /**
   * Lista todos os escalões (alias para index)
   */
   public async list({ response }: HttpContext) {
    try {
      const mapaIRT = await this.service.list()
      return response.json({
        success: true,
        data: mapaIRT
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar mapa IRT',
        error: error.message
      })
    }
  }

  /**
   * Busca um escalão específico
   */
  public async show({ params, response }: HttpContext) {
    try {
      const mapaIRT = await this.service.getById(params.id)
      
      if (!mapaIRT) {
        return response.status(404).json({
          success: false,
          message: 'Escalão não encontrado'
        })
      }

      return response.json({
        success: true,
        data: mapaIRT
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar escalão',
        error: error.message
      })
    }
  }

  /**
   * Cria um novo escalão
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'nome', 'valor_de', 'valor_ate', 'parcela', 
        'valor', 'percentagem', 'isento', 'total', 'status'
      ])

      const mapaIRT = await this.service.create(data)

      return response.status(201).json({
        success: true,
        message: 'Escalão criado com sucesso',
        data: mapaIRT
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao criar escalão',
        error: error.message
      })
    }
  }

  /**
   * Atualiza um escalão
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const data = request.only([
        'nome', 'valor_de', 'valor_ate', 'parcela', 
        'valor', 'percentagem', 'isento', 'total', 'status'
      ])

      const mapaIRT = await this.service.update(params.id, data)
      
      if (!mapaIRT) {
        return response.status(404).json({
          success: false,
          message: 'Escalão não encontrado'
        })
      }

      return response.json({
        success: true,
        message: 'Escalão atualizado com sucesso',
        data: mapaIRT
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao atualizar escalão',
        error: error.message
      })
    }
  }

  /**
   * Remove um escalão
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const deleted = await this.service.delete(params.id)
      
      if (!deleted) {
        return response.status(404).json({
          success: false,
          message: 'Escalão não encontrado'
        })
      }

      return response.json({
        success: true,
        message: 'Escalão removido com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao remover escalão',
        error: error.message
      })
    }
  }

  /**
   * Busca escalões ativos
   */
  public async active({ response }: HttpContext) {
    try {
      const mapaIRT = await this.service.getActive()

      return response.json({
        success: true,
        data: mapaIRT
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar escalões ativos',
        error: error.message
      })
    }
  }
}
