import Modulo from '../models/modulo.js'
import ModulosPermissoe from '../models/modulos_permissoe.js'
import Permissoe from '../models/permissoe.js'

export default class ModuloService {
  async listAll(page: number = 1, limit: number = 10, isPaginate: boolean = true) {
    if (isPaginate) {
      return await Modulo.query().paginate(page, limit)
    } else {
      const data = await Modulo.query()
      return {
        data,
        meta: {
          total: data.length,
          perPage: data.length,
          currentPage: 1,
          lastPage: 1,
        },
      }
    }
  }

  async list(search: string = '') {
    if (search.trim()) {
      return await Modulo.query().whereILike('name', `%${search}%`)
    }

    return await Modulo.all()
  }

  async findById(id: number) {
    return await Modulo.findOrFail(id)
  }

  async create(data: Partial<Modulo>) {
    return await Modulo.create(data)
  }

  async update(id: number, data: Partial<Modulo>) {
    const modulo = await Modulo.findOrFail(id)
    modulo.merge(data)
    await modulo.save()
    return modulo
  }

  async delete(id: number) {
    const modulo = await Modulo.findOrFail(id)
    await modulo.delete()
  }

  async attachPermissoes(moduloId: number, permissoesIds: number[]) {
    // Remove duplicados se houver
    const uniqueIds = [...new Set(permissoesIds)]

    const records = uniqueIds.map((permissaoId) => ({
      id_modulo: moduloId,
      id_permissao: permissaoId,
    }))

    await ModulosPermissoe.createMany(records)

    return records
  }

  async detachPermissoes(moduloId: number, permissoesIds: number[]) {
    const uniqueIds = [...new Set(permissoesIds)]

    const deletados = await ModulosPermissoe.query()
      .where('id_modulo', moduloId)
      .whereIn('id_permissao', uniqueIds)
      .delete()

    return { total_removidas: deletados }
  }

  async getPermissoesAssociadas(moduloId: number, search: string = '') {
    const permissoes = await Permissoe.query()
      .select('permissoes.*')
      .join('modulos_permissoes', 'permissoes.id', 'modulos_permissoes.id_permissao')
      .where('modulos_permissoes.id_modulo', moduloId)
      .if(search.trim() !== '', (query) => {
        query.whereILike('permissoes.name', `%${search}%`)
      })

    return permissoes
  }

  // Permissões NÃO associadas ao módulo
  async getPermissoesNaoAssociadas(moduloId: number, search: string = '') {
    const associadas = await ModulosPermissoe.query()
      .where('id_modulo', moduloId)
      .select('id_permissao')

    const idsAssociados = associadas.map((item) => item.id_permissao)

    const naoAssociadas = await Permissoe.query()
      .if(idsAssociados.length > 0, (query) => {
        query.whereNotIn('id', idsAssociados)
      })
      .if(search.trim() !== '', (query) => {
        query.whereILike('name', `%${search}%`)
      })

    return naoAssociadas
  }

  async listAllWithPermissoes() {
    const modulos = await Modulo.query().preload('permissoes')
    return modulos
  }
}
