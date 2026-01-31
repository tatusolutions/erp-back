import TipoAnexo from '../models/TipoAnexo.js'

export default class TipoAnexoService {
  async listAll(page: number = 1, limit: number = 10, search: string = '') {
    const query = TipoAnexo.query()

    if (search) {
      query.whereILike('nome', `%${search}%`)
        .orWhereILike('abreviacao', `%${search}%`)
    }  

    return await query.paginate(page, limit)
  } 

  async list() {
    return await TipoAnexo.query().where('estado', 'activo').orderBy('nome')
  }

  async findById(id: number) {
    return await TipoAnexo.findOrFail(id)
  }

  async create(data: Partial<TipoAnexo>) {
    return await TipoAnexo.create(data)
  }

  async update(id: number, data: Partial<TipoAnexo>) {
    const tipoAnexo = await TipoAnexo.findOrFail(id)
    tipoAnexo.merge(data)
    await tipoAnexo.save()
    return tipoAnexo
  }

  async delete(id: number) {
    const tipoAnexo = await TipoAnexo.findOrFail(id)
    await tipoAnexo.delete()
  }
}
