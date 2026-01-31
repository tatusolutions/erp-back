import Profissao from '../models/Profissao.js'

export default class ProfissaoService {
  async listAll(page: number = 1, limit: number = 10, search: string = '') {
    const query = Profissao.query()

    if (search) {
      query.whereILike('nome', `%${search}%`)
    } 

    return await query.paginate(page, limit)
  } 

  async list() {
    return await Profissao.all()
  }

  async findById(id: number) {
    return await Profissao.findOrFail(id)
  }

  async create(data: Partial<Profissao>) {
    return await Profissao.create(data)
  }

  async update(id: number, data: Partial<Profissao>) {
    const profissao = await Profissao.findOrFail(id)
    profissao.merge(data)
    await profissao.save()
    return profissao
  }

  async delete(id: number) {
    const profissao = await Profissao.findOrFail(id)
    await profissao.delete()
  }
}
