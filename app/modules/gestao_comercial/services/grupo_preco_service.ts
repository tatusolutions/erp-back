import GrupoPreco from '../models/GrupoPreco.js'

export default class GrupoPrecoService {
  async listAll(page: number = 1, limit: number = 10) {
    return await GrupoPreco.query().paginate(page, limit)
  }

  async list() {
    return await GrupoPreco.all()
  }

  async findById(id: number) {
    return await GrupoPreco.findOrFail(id)
  }

  async create(data: Partial<GrupoPreco>) {
    return await GrupoPreco.create(data)
  }

  async update(id: number, data: Partial<GrupoPreco>) {
    const grupo = await GrupoPreco.findOrFail(id)
    grupo.merge(data)
    await grupo.save()
    return grupo
  }

  async delete(id: number) {
    const grupo = await GrupoPreco.findOrFail(id)
    await grupo.delete()
  }
}
