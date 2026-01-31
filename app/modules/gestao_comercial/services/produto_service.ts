import Produto from '../models/Produto.js'

export default class ProdutoService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Produto.query()
      .preload('tipoProduto')
      .preload('empresa')
      .preload('linhaRegime')
      .preload('marca')
      .preload('variacao')
      .preload('categoria')
      .paginate(page, limit)
  }

  async list() {
    return await Produto.all()
  }

  async findById(id: number) {
    return await Produto.query()
      .where('id', id)
      .preload('tipoProduto')
      .preload('empresa')
      .preload('linhaRegime')
      .preload('marca')
      .preload('variacao')
      .preload('categoria')
      .firstOrFail()
  }

  async create(data: Partial<Produto>) {
    return await Produto.create(data)
  }

  async update(id: number, data: Partial<Produto>) {
    const produto = await Produto.findOrFail(id)
    produto.merge(data)
    await produto.save()
    return produto
  }

  async delete(id: number) {
    const produto = await Produto.findOrFail(id)
    await produto.delete()
  }
}
