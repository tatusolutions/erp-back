import type { HttpContext } from '@adonisjs/core/http'
import ModuloService from '../services/modulo_service.js'

export default class ModulosController {
  constructor(private service = new ModuloService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
    return response.status(200).json({ data })
  }

  public async list({ request, response }: HttpContext) {
    const search = request.input('search', '')
    const data = await this.service.list(search)
    return response.status(200).json({ data })
  }

  public async listAllWithPermissoes({ response }: HttpContext) {
    const data = await this.service.listAllWithPermissoes()
    return response.status(200).json({ data })
  }

  async store({ request, response }: HttpContext) {
    await this.service.create(request.only(['name', 'slug']))
    return response.status(201).json({
      data: {
        message: 'Modulo criado com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    return response.ok(await this.service.findById(params.id))
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.only(['name', 'slug']))
    return response.status(201).json({
      data: {
        message: 'Modulo editado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.status(200).json({
      data: {
        message: 'Módulo eliminado com sucesso',
      },
    })
  }

  async attachPermissoes({ request, response }: HttpContext) {
    const { id_modulo: idModulo, ids_permissoes: idsPermissoes } = request.only([
      'id_modulo',
      'ids_permissoes',
    ])

    if (!Array.isArray(idsPermissoes) || idsPermissoes.length === 0) {
      return response.badRequest({ message: 'É necessário fornecer um array de permissões.' })
    }

    const result = await this.service.attachPermissoes(idModulo, idsPermissoes)

    return response.created({ message: 'Permissões associadas com sucesso.', data: result })
  }

  async detachPermissoes({ request, response }: HttpContext) {
    const { id_modulo: idModulo, ids_permissoes: idsPermissoes } = request.only([
      'id_modulo',
      'ids_permissoes',
    ])

    if (!Array.isArray(idsPermissoes) || idsPermissoes.length === 0) {
      return response.badRequest({ message: 'É necessário fornecer um array de permissões.' })
    }

    const result = await this.service.detachPermissoes(idModulo, idsPermissoes)

    return response.ok({ message: 'Permissões desassociadas com sucesso.', data: result })
  }

  async permissoesAssociadas({ params, response, request }: HttpContext) {
    const { id } = params
    const search = request.input('search', '')
    try {
      const data = await this.service.getPermissoesAssociadas(id, search)
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({ message: 'Erro ao buscar permissões associadas.', error })
    }
  }

  async permissoesNaoAssociadas({ params, response, request }: HttpContext) {
    const { id } = params
    const search = request.input('search', '')
    try {
      const data = await this.service.getPermissoesNaoAssociadas(id, search)
      return response.status(200).json({ data })
    } catch (error) {
      return response
        .status(500)
        .json({ message: 'Erro ao buscar permissões não associadas.', error })
    }
  }
}
