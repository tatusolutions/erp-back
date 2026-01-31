import Marca from '../models/Marca.js'

export default class MarcaService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Marca.query().paginate(page, limit)
  }

  async list() {
    return await Marca.all()
  }

  async findById(id: number) {
    return await Marca.findOrFail(id)
  }

  async create(data: Partial<Marca>) {
    return await Marca.create(data)
  }

  async update(id: number, data: Partial<Marca>) {
    const marca = await Marca.findOrFail(id)
    marca.merge(data)
    await marca.save()
    return marca
  }

  async delete(id: number) {
    const marca = await Marca.findOrFail(id)
    await marca.delete()
  }
}
