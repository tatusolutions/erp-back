import type { HttpContext } from '@adonisjs/core/http'
import MoedaService from '../services/moeda_service.js'

export default class MoedaController {
  constructor(private service = new MoedaService()) {}

  public async list({ response }: HttpContext) {
    const data = await this.service.listMoeda()
    return response.status(200).json({ data })
  }

  public async show({ response, params }: HttpContext) {
    const data = await this.service.showMoeda(params.id)
    return response.status(200).json({ data })
  }
}
