import Variacoe from '../models/Variacoe.js'

export default class VariacaoService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Variacoe.query().paginate(page, limit)
  }

  async list() {
    return await Variacoe.all()
  }

  async findById(id: number) {
    return await Variacoe.findOrFail(id)
  }

  async create(data: Partial<Variacoe>) {
    return await Variacoe.create(data)
  }

  async update(id: number, data: Partial<Variacoe>) {
    const variacao = await Variacoe.findOrFail(id)
    variacao.merge(data)
    await variacao.save()
    return variacao
  }

  async delete(id: number) {
    const variacao = await Variacoe.findOrFail(id)
    await variacao.delete()
  }
}
