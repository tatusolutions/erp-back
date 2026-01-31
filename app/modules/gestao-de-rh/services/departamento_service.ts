import Departamento from '../models/Departamento.js'

export default class DepartamentoService {
  async listAll(page: number = 1, limit: number = 10, search: string = '') {
    const query = Departamento.query()

    if (search) {
      query.whereILike('nome_departamento', `%${search}%`)
    }  

    return await query.paginate(page, limit)
  } 

  async list() {
    return await Departamento.all()
  }

  async findById(id: number) {
    return await Departamento.findOrFail(id)
  }

  async create(data: Partial<Departamento>) {
    return await Departamento.create(data)
  }

  async update(id: number, data: Partial<Departamento>) {
    const departamento = await Departamento.findOrFail(id)
    departamento.merge(data)
    await departamento.save()
    return departamento
  }

  async delete(id: number) {
    const departamento = await Departamento.findOrFail(id)
    await departamento.delete()
  }
}
