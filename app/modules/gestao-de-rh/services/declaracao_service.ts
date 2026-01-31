import { inject } from '@adonisjs/core'
import Declaracao from '../models/Declaracao.js'

@inject()
export default class DeclaracaoService {
  constructor() {}

  public async listAll(page: number = 1, limit: number = 10, search: string = '') {
    const query = Declaracao.query()
      .preload('colaborador')
      .preload('empresa')
      .preload('user')

    if (search) {
      query.where('finalidade', 'LIKE', `%${search}%`)
           .orWhere('estado', 'LIKE', `%${search}%`)
    }

    return await query.paginate(page, limit)
  }

  public async list() {
    return await Declaracao.all()
  }

  public async create(data: any) {
    return await Declaracao.create(data)
  }

  public async findById(id: number) {
    return await Declaracao.query()
      .where('id', id)
      .preload('colaborador')
      .preload('empresa')
      .preload('user')
      .firstOrFail()
  }

  public async update(id: number, data: any) {
    const declaracao = await Declaracao.findOrFail(id)
    declaracao.merge(data)
    await declaracao.save()
    return declaracao
  }

  public async delete(id: number) {
    const declaracao = await Declaracao.findOrFail(id)
    await declaracao.delete()
  }

  public async getByColaborador(id_colaborador: number) {
    return await Declaracao.query()
      .where('id_colaborador', id_colaborador)
      .preload('colaborador')
      .preload('empresa')
      .preload('user')
  }
}
