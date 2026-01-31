import type { HttpContext } from '@adonisjs/core/http'
import MunicipioService from '../services/municipio_service.js'

export default class MunicipioController {
  constructor(private service = new MunicipioService()) {}

  public async list({ params, response }: HttpContext) {
    const idProvincia = params.id
    const data = await this.service.list(idProvincia)
    return response.status(200).json({ data })
  }
}
