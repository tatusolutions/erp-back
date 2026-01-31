import Categoria from '../models/Categoria.js'

export default class CategoriaService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Categoria.query().paginate(page, limit)
  }

  async list() {
    return await Categoria.all()
  }

  async findById(id: number) {
    return await Categoria.findOrFail(id)
  }

  async create(data: Partial<Categoria>) {
    return await Categoria.create(data)
  }

  async update(id: number, data: Partial<Categoria>) {
    const categoria = await Categoria.findOrFail(id)
    categoria.merge(data)
    await categoria.save()
    return categoria
  }

  async delete(id: number) {
    const categoria = await Categoria.findOrFail(id)
    await categoria.delete()
  }
}
