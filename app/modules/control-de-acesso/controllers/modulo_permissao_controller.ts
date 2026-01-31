// services/permissao_role_service.ts
import PermissaoRole from '../models/permissoes_role.js'
import Database from '@adonisjs/lucid/services/db'

export default class PermissaoRoleService {
  // async attach(roleId: number, permissaoId?: number) {
  //   return PermissaoRole.create({ roleId, permissaoId })
  // }

  async detach(roleId: number, permissaoId: number) {
    await Database.from('permissoes_roles')
      .where({ role_id: roleId, permissao_id: permissaoId })
      .delete()
  }

  async listByRole(roleId: number) {
    return PermissaoRole.query().where('role_id', roleId).preload('permissao')
  }

  async listByPermissao(permissaoId: number) {
    return PermissaoRole.query().where('permissao_id', permissaoId).preload('role')
  }
}
