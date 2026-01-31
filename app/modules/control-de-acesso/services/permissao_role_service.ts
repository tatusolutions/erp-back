import PermissoesRole from '../models/permissoes_role.js'
import Database from '@adonisjs/lucid/services/db'

export default class PermissaoRoleService {
  //   async attach(roleId: number, permissaoId: number) {
  //     return PermissaoRole.create({ roleId, permissaoId })
  //   }

  async listAll() {
    return await PermissoesRole.all()
  }

  async create(data: any) {
    return await PermissoesRole.create(data)
  }

  async detach(roleId: number, permissaoId: number) {
    await Database.from('permissoes_roles')
      .where({ role_id: roleId, permissao_id: permissaoId })
      .delete()
  }

  async listByRole(roleId: number) {
    return PermissoesRole.query().where('id_role', roleId).preload('permissao')
  }

  async listByPermissao(permissaoId: number) {
    return PermissoesRole.query().where('permissao_id', permissaoId).preload('role')
  }

  async syncRolePermissoes(id_role: number, permissaoIds: number[]) {
    return await Database.transaction(async (trx) => {
      // Normaliza os dados recebidos
      permissaoIds = Array.isArray(permissaoIds)
        ? permissaoIds.filter((id) => Number.isInteger(id))
        : []

      // Pega as permissões atuais do role
      const permissoesAtuais = await PermissoesRole.query().where('id_role', id_role)

      const idsAtuais = permissoesAtuais
        .map((p) => {
          return Number(p.$attributes?.idPermissao)
        })
        .filter((id) => Number.isInteger(id))

      const permissaoIdsNormalizados = permissaoIds
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id))

      // ➖ Permissões a remover: estavam antes, mas agora não estão
      const idsParaRemover = idsAtuais.filter((id) => !permissaoIdsNormalizados.includes(id))

      // ➕ Permissões a adicionar: não estavam antes, mas agora estão
      const idsParaAdicionar = permissaoIdsNormalizados.filter((id) => !idsAtuais.includes(id))

      // Remove permissões antigas
      if (idsParaRemover.length > 0) {
        await PermissoesRole.query()
          .where('id_role', id_role)
          .whereIn('id_permissao', idsParaRemover)
          .delete()
      }

      // Adiciona novas permissões, evitando duplicação
      for (const idPermissao of idsParaAdicionar) {
        await PermissoesRole.firstOrCreate({ id_role, idPermissao }, {}, { client: trx })
      }

      return {
        added: idsParaAdicionar,
        removed: idsParaRemover,
      }
    })
  }

  async listModulosWithPermissoesByRole(roleId: number) {
    // Buscar todos os módulos com todas as permissões + marcar se estão associadas ao role
    const rows = await Database.from('modulos')
      .leftJoin('modulos_permissoes', 'modulos.id', 'modulos_permissoes.id_modulo')
      .leftJoin('permissoes', 'modulos_permissoes.id_permissao', 'permissoes.id')
      .leftJoin('permissoes_roles', (builder) => {
        builder
          .on('permissoes.id', '=', 'permissoes_roles.id_permissao')
          .andOnVal('permissoes_roles.id_role', '=', roleId)
      })
      .select(
        'modulos.id as modulo_id',
        'modulos.name as modulo_name',
        'permissoes.id as permissao_id',
        'permissoes.name as permissao_name',
        'permissoes_roles.id_role as role_associado' // se null => não associado
      )
      .orderBy('modulos.id')
      .orderBy('permissoes.id')

    if (rows.length === 0) {
      return []
    }

    // Agrupar resultado
    const modulosMap = new Map<number, any>()

    rows.forEach((row) => {
      const moduloId = row.modulo_id
      const moduloName = row.modulo_name

      // Garantir que o módulo esteja no mapa
      if (!modulosMap.has(moduloId)) {
        modulosMap.set(moduloId, {
          id: moduloId,
          name: moduloName,
          permissoes: [],
        })
      }

      // Se houver permissão (porque pode ter módulo sem nenhuma permissão)
      if (row.permissao_id) {
        modulosMap.get(moduloId).permissoes.push({
          id: row.permissao_id,
          name: row.permissao_name,
          assigned: row.role_associado !== null, // true se estiver associado, false se não
        })
      }
    })

    // Retornar array de módulos
    return Array.from(modulosMap.values())
  }
}
