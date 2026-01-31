import LinhasRegime from '../models/LinhasRegime.js'

export default class LinhaRegimeService {
  async listAll(page: number = 1, limit: number = 10) {
    return await LinhasRegime.query().paginate(page, limit)
  }

  async list() {
    return await LinhasRegime.all()
  }

  async findById(id: number) {
    return await LinhasRegime.findOrFail(id)
  }

  async create(data: Partial<LinhasRegime>) {
    return await LinhasRegime.create(data)
  }

  async update(id: number, data: Partial<LinhasRegime>) {
    const linha = await LinhasRegime.findOrFail(id)
    linha.merge(data)
    await linha.save()
    return linha
  }

  async delete(id: number) {
    const linha = await LinhasRegime.findOrFail(id)
    await linha.delete()
  }
}
