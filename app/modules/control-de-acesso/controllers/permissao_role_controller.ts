import { HttpContext } from '@adonisjs/core/http'
import PermissaoRoleService from '../services/permissao_role_service.js'

export default class PermissaoRoleController {
  constructor(private service = new PermissaoRoleService()) {}

  async index({ response }: HttpContext) {
    const result = await this.service.listAll()
    return response.ok(result)
  }

  async listModulosWithPermissoesByRole({ params, response }: HttpContext) {
    const { id } = params
    const result = await this.service.listModulosWithPermissoesByRole(id)
    return response.ok(result)
  }

  async syncRolePermissoes({ request, response }: HttpContext) {
    const idRole = request.input('roleId')
    const permissaoIds = request.input('permissaoIds', []) as number[]

    if (!idRole || !Array.isArray(permissaoIds)) {
      return response.badRequest({ message: 'roleId e permissaoIds são obrigatórios' })
    }

    await this.service.syncRolePermissoes(idRole, permissaoIds)

    return response.ok({ message: 'Permissões sincronizadas com sucesso' })
  }
}
