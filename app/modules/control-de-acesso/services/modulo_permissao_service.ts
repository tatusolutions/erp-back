// services/modulo_permissao_service.ts
import ModuloPermissao from '../models/modulos_permissoe.js'
import Database from '@adonisjs/lucid/services/db'

export default class ModuloPermissaoService {
  //   async attach(moduloId: number, permissaoId: number) {
  //     return ModuloPermissao.create({ moduloId, permissaoId })
  //   }

  async detach(moduloId: number, permissaoId: number) {
    await Database.from('modulos_permissoes')
      .where({ modulo_id: moduloId, permissao_id: permissaoId })
      .delete()
  }

  async listByModulo(moduloId: number) {
    return ModuloPermissao.query().where('modulo_id', moduloId).preload('permissao')
  }

  async listByPermissao(permissaoId: number) {
    return ModuloPermissao.query().where('permissao_id', permissaoId).preload('modulo')
  }
}
