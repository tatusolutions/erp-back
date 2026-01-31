import Cliente from '../models/Cliente.js'

export default class ClienteService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Cliente.query()
      .preload('grupoPreco')
      .preload('municipio')
      .preload('empresa')
      .paginate(page, limit)
  }

  async list() {
    return await Cliente.all()
  }

  async findById(id: number) {
    return await Cliente.query()
      .where('id', id)
      .preload('grupoPreco')
      .preload('municipio')
      .preload('empresa')
      .firstOrFail()
  }

  async create(data: Partial<Cliente>) {
    return await Cliente.create(data)
  }

  async update(id: number, data: Partial<Cliente>) {
    const cliente = await Cliente.findOrFail(id)
    cliente.merge(data)
    await cliente.save()
    return cliente
  }

  async delete(id: number) {
    const cliente = await Cliente.findOrFail(id)
    await cliente.delete()
  }
}
