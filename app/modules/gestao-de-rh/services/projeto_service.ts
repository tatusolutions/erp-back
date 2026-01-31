import Projeto from '../models/Projeto.js'
import { DateTime } from 'luxon'
import Estagiario from '../models/Estagiario.js'

export default class ProjetoService {
  async listAll(page: number = 1, limit: number = 10, search: string = '', status: string = '') {
    const query = Projeto.query()
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')

    if (search) {
      query.whereILike('nome', `%${search}%`)
        .orWhereILike('codigo', `%${search}%`)
        .orWhereILike('cliente', `%${search}%`)
    }

    if (status) {
      query.where('status', status)
    }

    return await query.paginate(page, limit)
  }

  async list() {
    return await Projeto.query()
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')
  }

  async findById(id: number) {
    return await Projeto.query()
      .where('id', id)
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')
      .firstOrFail()
  }

  async create(data: Partial<Projeto>) {
    return await Projeto.create(data)
  }

  async update(id: number, data: Partial<Projeto>) {
    const projeto = await Projeto.findOrFail(id)
    projeto.merge(data)
    await projeto.save()
    return projeto
  }

  async delete(id: number) {
    const projeto = await Projeto.findOrFail(id)
    
    // Verificar se há estagiários vinculados ao projeto
    const estagiariosCount = await Estagiario.query()
      .where('id_projeto', id)
      .count('* as total')
    
    const totalEstagiarios = estagiariosCount[0]?.$extras?.total || 0
    
    if (totalEstagiarios > 0) {
      throw new Error(`Não é possível excluir o projeto pois existem ${totalEstagiarios} estagiário(s) vinculado(s) ao projeto.`)
    }
    
    await projeto.delete()
  }

  async getProjetosAtivos() {
    return await Projeto.query()
      .where('status', 'em_andamento')
      .orWhere('status', 'planejamento')
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')
  }

  async atualizarStatus(id: number, status: string): Promise<void> {
    const projeto = await Projeto.findOrFail(id)
    projeto.status = status
    
    if (status === 'concluido') {
      projeto.data_fim_real = DateTime.now()
    }
    
    await projeto.save()
  }

  async atualizarProgresso(id: number, progresso: number): Promise<void> {
    const projeto = await Projeto.findOrFail(id)
    projeto.progresso = Math.min(100, Math.max(0, progresso))
    await projeto.save()
  }

  async gerarRelatorio(id: number) {
    const projeto = await this.findById(id)
    
    const duracao = projeto.data_fim_real && projeto.data_inicio 
      ? projeto.data_fim_real.diff(projeto.data_inicio, 'days').days 
      : null

    const custoEficiencia = projeto.orcamento && projeto.custo_atual
      ? ((projeto.orcamento - projeto.custo_atual) / projeto.orcamento * 100)
      : null

    return {
      projeto: {
        id: projeto.id,
        nome: projeto.nome,
        codigo: projeto.codigo,
        status: projeto.status,
        progresso: projeto.progresso,
        gestor: projeto.gestor?.nome || '',
        departamento: projeto.departamento?.nome || '',
        empresa: projeto.empresa?.nome || '',
        cliente: projeto.cliente,
        orcamento: projeto.orcamento,
        custo_atual: projeto.custo_atual,
        data_inicio: projeto.data_inicio,
        data_fim_prevista: projeto.data_fim_prevista,
        data_fim_real: projeto.data_fim_real
      },
      metricas: {
        duracao_dias: duracao,
        eficiencia_custo: custoEficiencia,
        progresso_real: projeto.progresso,
        status_atual: projeto.status
      }
    }
  }

  async findByGestor(gestorId: number) {
    return await Projeto.query()
      .where('id_gestor', gestorId)
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')
  }

  async findByDepartamento(departamentoId: number) {
    return await Projeto.query()
      .where('id_departamento', departamentoId)
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')
  }

  async findByEmpresa(empresaId: number) {
    return await Projeto.query()
      .where('id_empresa', empresaId)
      .preload('empresa')
      .preload('departamento')
      .preload('gestor')
  }
}
