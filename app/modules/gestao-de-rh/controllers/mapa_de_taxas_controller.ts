import type { HttpContext } from '@adonisjs/core/http'
import MapaDeTaxas from '../models/MapaDeTaxas.js'

export default class MapaDeTaxasController {
  /**
   * Lista todas as taxas
   */
  public async index({ response }: HttpContext) {
    try {
      const taxas = await MapaDeTaxas.query().orderBy('id', 'asc')
      return response.json({
        success: true,
        data: taxas
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar taxas',
        error: error.message
      })
    }
  }

  /**
   * Lista todas as taxas (alias para index)
   */
  public async list({ response }: HttpContext) {
    return this.index({ response })
  }

  /**
   * Busca uma taxa específica
   */
  public async show({ params, response }: HttpContext) {
    try {
      const taxa = await MapaDeTaxas.find(params.id)
      
      if (!taxa) {
        return response.status(404).json({
          success: false,
          message: 'Taxa não encontrada'
        })
      }

      return response.json({
        success: true,
        data: taxa
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar taxa',
        error: error.message
      })
    }
  }

  /**
   * Cria uma nova taxa
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'ss', 'ss_empresa', 'ss_trabalhador', 'status'
      ])

      const taxa = await MapaDeTaxas.create(data)

      return response.status(201).json({
        success: true,
        message: 'Taxa criada com sucesso',
        data: taxa
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao criar taxa',
        error: error.message
      })
    }
  }

  /**
   * Atualiza uma taxa
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const taxa = await MapaDeTaxas.find(params.id)
      
      if (!taxa) {
        return response.status(404).json({
          success: false,
          message: 'Taxa não encontrada'
        })
      }

      const data = request.only([
        'ss', 'ss_empresa', 'ss_trabalhador', 'status'
      ])

      taxa.merge(data)
      await taxa.save()

      return response.json({
        success: true,
        message: 'Taxa atualizada com sucesso',
        data: taxa
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao atualizar taxa',
        error: error.message
      })
    }
  }

  /**
   * Remove uma taxa
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const taxa = await MapaDeTaxas.find(params.id)
      
      if (!taxa) {
        return response.status(404).json({
          success: false,
          message: 'Taxa não encontrada'
        })
      }

      await taxa.delete()

      return response.json({
        success: true,
        message: 'Taxa removida com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao remover taxa',
        error: error.message
      })
    }
  }

  /**
   * Busca taxas ativas
   */
  public async active({ response }: HttpContext) {
    try {
      const taxas = await MapaDeTaxas.query()
        .where('status', 'activo')
        .orderBy('id', 'asc')

      return response.json({
        success: true,
        data: taxas
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Erro ao buscar taxas ativas',
        error: error.message
      })
    }
  }
}
