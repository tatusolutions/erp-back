import type { HttpContext } from '@adonisjs/core/http'
import ProviciaService from '../services/provincia_service.js'

export default class ProvinciaController {
  constructor(private service = new ProviciaService()) {}

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.status(200).json({ data })
  }
}
