import Estabelecimento from '../models/Estabelecimento.js'

export default class EstabelecimentoService {
  async listAll(page: number = 1, limit: number = 10, search: string = '', estado: string | null = null) {
    const query = Estabelecimento.query()

    if (search) {
      query.whereILike('nome', `%${search}%`)
    }

    if (estado) {
      query.where('estado', estado)
    }

    return await query.paginate(page, limit)
  }

  async list() {
    return await Estabelecimento.all()
  }

  async findById(id: number) {
    return await Estabelecimento.findOrFail(id)
  }

  async create(data: Partial<Estabelecimento>) {
    const existe = await Estabelecimento.query().where('nome', data.nome!).first()

    if (existe) {
      throw new Error('Já existe um estabelecimento com este nome')
    }

    return await Estabelecimento.create(data)
  }

  async update(id: number, data: Partial<Estabelecimento>) {
    const estabelecimento = await Estabelecimento.findOrFail(id)
    estabelecimento.merge(data)
    await estabelecimento.save()
    return estabelecimento
  }

  async delete(id: number) {
    const estabelecimento = await Estabelecimento.findOrFail(id)
    await estabelecimento.delete()
  }
}
