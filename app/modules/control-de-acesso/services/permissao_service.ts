import Permissoe from '../models/permissoe.js'

export default class PermissaoService {
  async listAll(page: number = 1, limit: number = 10, isPaginate: boolean = true) {
    if (isPaginate) {
      return await Permissoe.query().paginate(page, limit)
    } else {
      const data = await Permissoe.query()
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

  async findById(id: number) {
    return await Permissoe.findOrFail(id)
  }

  async create(data: Partial<Permissoe>) {
    return await Permissoe.create(data)
  }

  async update(id: number, data: Partial<Permissoe>) {
    const permissao = await Permissoe.findOrFail(id)
    permissao.merge(data)
    await permissao.save()
    return permissao
  }

  async delete(id: number) {
    const permissao = await Permissoe.findOrFail(id)
    await permissao.delete()
  }
}
