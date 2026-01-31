import Role from '../models/role.js'
import PermissaoRole from '../models/permissoes_role.js'

export default class RoleService {
  async listAll(page: number = 1, limit: number = 10, isPaginate: boolean = true) {
    if (isPaginate) {
      return await Role.query().paginate(page, limit)
    } else {
      const data = await Role.query()
      return {
        data,
        meta: {
          total: data.length,
          perPage: data.length,
          currentPage: 1,
          lastPage: 1,
        },
      }
    }
  }

  async list() {
    return await Role.all()
  }

  async findById(id: number) {
    return await Role.findOrFail(id)
  }

  async create(data: Partial<Role>) {
    return await Role.create(data)
  }

  async update(id: number, data: Partial<Role>) {
    const role = await Role.findOrFail(id)
    role.merge(data)
    await role.save()
    return role
  }

  async delete(id: number) {
    const role = await Role.findOrFail(id)
    await role.delete()
  }

  async attachPermissao(roleId: number, permissaoId: number) {
    return await PermissaoRole.create({ id_role: roleId, idPermissao: permissaoId })
  }
}
