import type { HttpContext } from '@adonisjs/core/http'
import TipoDeProdutoService from '../services/tipo_de_produto_service.js'

export default class TipoDeProdutoController {
  constructor(private service = new TipoDeProdutoService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
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
        message: 'Tipo de Produto criado com sucesso',
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
        message: 'Tipo de Produto atualizado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }
}
