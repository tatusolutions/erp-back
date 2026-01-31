import type { HttpContext } from '@adonisjs/core/http'
import PermissaoService from '../services/permissao_service.js'

export default class PermissoesController {
  constructor(private service = new PermissaoService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
    return response.status(200).json({ data })
  }

  async store({ request, response }: HttpContext) {
    await this.service.create(request.only(['name', 'slug']))
    return response.status(201).json({
      data: {
        message: 'Permissão criada com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const permissao = await this.service.findById(params.id)
    return response.ok(permissao)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.only(['name', 'slug']))
    return response.status(201).json({
      data: {
        message: 'Permissão editada com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.status(200).json({
      data: {
        message: 'Permissão eliminada com sucesso',
      },
    })
  }
}
