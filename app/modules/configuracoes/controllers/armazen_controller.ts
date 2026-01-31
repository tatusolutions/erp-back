import type { HttpContext } from '@adonisjs/core/http'
import ArmazenService from '../services/armazen_service.js'

export default class ArmazenController {
  constructor(private service = new ArmazenService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const estado = request.input('estado', null)
    const data = await this.service.listAll(page, limit, search, estado)
    return response.ok({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.ok({ data })
  }

  async store({ request, response }: HttpContext) {
    await this.service.create(request.all())
    return response.created({
      data: {
        message: 'Armazém criado com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.ok(data)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.all())
    return response.ok({
      data: {
        message: 'Armazém atualizado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }

  async proximaSerie({ request, response }: HttpContext) {
    try {
      const { empresa_id } = request.qs()
      if (!empresa_id) {
        return response.badRequest({ 
          message: 'O parâmetro empresa_id é obrigatório' 
        })
      }
      const result = await this.service.getProximaSerie(Number(empresa_id))
      return response.ok(result)
    } catch (error) {
      return response.status(500).json({ 
        error: 'Falha ao obter próxima série',
        details: error.message 
      })
    }
  }

  async verificarSerie({ request, response }: HttpContext) {
    const { serie, empresa_id } = request.qs()
    if (!serie || !empresa_id) {
      return response.badRequest({ 
        message: 'Os parâmetros série e empresa_id são obrigatórios' 
      })
    }
    try {
      const result = await this.service.verificarSerieExistente(serie, Number(empresa_id))
      return response.ok(result)
    } catch (error) {
      return response.status(500).json({ 
        error: 'Falha ao verificar série',
        details: error.message 
      })
    }
  }
}