import Loja from '../models/Loja.js'

export default class LojaService {
  async listAll(page: number = 1, limit: number = 10, search: string = '', estado: string | null = null) {
    const query = Loja.query()

    if (search) {
      query.whereILike('nome', `%${search}%`)
    }

    if (estado) {
      query.where('estado', estado)
    }

    return await query.paginate(page, limit)
  } 

  async list() {
    return await Loja.all()
  }

  async findById(id: number) {
    return await Loja.findOrFail(id)
  }

  async create(data: Partial<Loja>) {
    return await Loja.create(data)
  }

  async update(id: number, data: Partial<Loja>) {
    const loja = await Loja.findOrFail(id)
    loja.merge(data)
    await loja.save()
    return loja
  }

  async delete(id: number) {
    const loja = await Loja.findOrFail(id)
    await loja.delete()
  }
}
