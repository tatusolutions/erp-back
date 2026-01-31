import ProdutosArmazem from '../models/ProdutosArmazem.js'

export default class ProdutosArmazemService {
  async listAll(page: number = 1, limit: number = 10) {
    return await ProdutosArmazem.query()
      .preload('empresa')
      .preload('produto')
      .preload('armazen')
      .paginate(page, limit)
  }

  async list() {
    return await ProdutosArmazem.all()
  }

  async findById(id: number) {
    return await ProdutosArmazem.query()
      .where('id', id)
      .preload('empresa')
      .preload('produto')
      .preload('armazen')
      .firstOrFail()
  }

  async create(data: Partial<ProdutosArmazem>) {
    return await ProdutosArmazem.create(data)
  }

  async update(id: number, data: Partial<ProdutosArmazem>) {
    const item = await ProdutosArmazem.findOrFail(id)
    item.merge(data)
    await item.save()
    return item
  }

  async delete(id: number) {
    const item = await ProdutosArmazem.findOrFail(id)
    await item.delete()
  }
}
