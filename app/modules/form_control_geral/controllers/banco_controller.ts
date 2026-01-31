import type { HttpContext } from '@adonisjs/core/http'
import BancoService from '../services/banco_service.js'

export default class BancoController {
  constructor(private service = new BancoService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
    return response.status(200).json({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.status(200).json({ data })
  }

  public async listMoeda({ response }: HttpContext) {
    const data = await this.service.listMoeda()
    return response.status(200).json({ data })
  }

  async store({ request, response }: HttpContext) {
    await this.service.create(request.all())

    return response.status(201).json({
      data: {
        message: 'Banco criado com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const role = await this.service.findById(params.id)
    return response.ok(role)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.all())
    return response.status(201).json({
      data: {
        message: 'Banco Editado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }
}
