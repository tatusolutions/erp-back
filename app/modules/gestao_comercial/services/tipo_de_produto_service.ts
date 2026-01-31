import TipoDeProduto from '../models/TiposDeProduto.js'

export default class TipoDeProdutoService {
  async listAll(page: number = 1, limit: number = 10) {
    return await TipoDeProduto.query().paginate(page, limit)
  }

  async list() {
    return await TipoDeProduto.all()
  }

  async findById(id: number) {
    return await TipoDeProduto.findOrFail(id)
  }

  async create(data: Partial<TipoDeProduto>) {
    return await TipoDeProduto.create(data)
  }

  async update(id: number, data: Partial<TipoDeProduto>) {
    const tipo = await TipoDeProduto.findOrFail(id)
    tipo.merge(data)
    await tipo.save()
    return tipo
  }

  async delete(id: number) {
    const tipo = await TipoDeProduto.findOrFail(id)
    await tipo.delete()
  }
}
