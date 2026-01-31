import Banco from '../models/Banco.js'

import Moeda from '../models/Moeda.js'

export default class BancoService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Banco.query().paginate(page, limit)
  }

  async list() {
    return await Banco.all()
  }

  async listMoeda() {
    return await Moeda.all()
  }

  async findById(id: number) {
    return await Banco.findOrFail(id)
  }

  async create(data: Partial<Banco>) {
    return await Banco.create(data)
  }

  async update(id: number, data: Partial<Banco>) {
    const dado = await Banco.findOrFail(id)
    dado.merge(data)
    await dado.save()
    return dado
  }

  async delete(id: number) {
    const dado = await Banco.findOrFail(id)
    await dado.delete()
  }
}
