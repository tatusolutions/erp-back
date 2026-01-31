import TaxRegime from '../models/TaxRegime.js'


export default class TaxRegimeService {
  async listAll(page: number = 1, limit: number = 10) {
    return await TaxRegime.query().paginate(page, limit)
  }

  async list() {
    return await TaxRegime.all()
  }

  async findById(id: number) {
    return await TaxRegime.findOrFail(id)
  }

  async create(data: Partial<TaxRegime>) {
    return await TaxRegime.create(data)
  }

  async update(id: number, data: Partial<TaxRegime>) {
    const variacao = await TaxRegime.findOrFail(id)
    variacao.merge(data)
    await variacao.save()
    return variacao
  }

  async delete(id: number) {
    const variacao = await TaxRegime.findOrFail(id)
    await variacao.delete()
  }
}
