import type { HttpContext } from '@adonisjs/core/http'
import RoleService from '../services/role_service.js'

export default class RolesController {
  constructor(private service = new RoleService()) {}

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

  async store({ request, response }: HttpContext) {
    await this.service.create(request.only(['name']))

    return response.status(201).json({
      data: {
        message: 'Role criado com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const role = await this.service.findById(params.id)
    return response.ok(role)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.only(['name', 'slug']))
    return response.status(201).json({
      data: {
        message: 'Role Editado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.status(200).json({
      data: {
        message: 'Role eliminado com sucesso',
      },
    })
  }

  async attachPermissao({ request, response }: HttpContext) {
    const { id_role: idRole, id_permissao: idPermissao } = request.only(['id_role', 'id_permissao'])

    const result = await this.service.attachPermissao(idRole, idPermissao)
    return response.created(result)
  }
}
