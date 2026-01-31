import Estagiario from '../models/Estagiario.js'
import { DateTime } from 'luxon'

export default class EstagiarioService {
  async listAll(page: number = 1, limit: number = 10, search: string = '', status: string = '') {
    const query = Estagiario.query()
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')

    if (search) {
      query.whereILike('nome', `%${search}%`)
        .orWhereILike('curso', `%${search}%`)
        .orWhereILike('instituicao_ensino', `%${search}%`)
    }

    if (status) {
      query.where('status_estagio', status)
    }

    return await query.paginate(page, limit)
  }

  async list() {
    return await Estagiario.query()
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }

  async findById(id: number) {
    return await Estagiario.query()
      .where('id', id)
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
      .firstOrFail()
  }

  async create(data: Partial<Estagiario>) {
    return await Estagiario.create(data)
  }

  async update(id: number, data: Partial<Estagiario>) {
    const estagiario = await Estagiario.findOrFail(id)
    estagiario.merge(data)
    await estagiario.save()
    return estagiario
  }

  async delete(id: number) {
    const estagiario = await Estagiario.findOrFail(id)
    await estagiario.delete()
  }

  async getEstagiariosAtivos() {
    return await Estagiario.query()
      .where('status_estagio', 'ativo')
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }

  async atualizarStatusEstagio(id: number, status: string): Promise<void> {
    const estagiario = await Estagiario.findOrFail(id)
    estagiario.status_estagio = status

    if (status === 'concluido') {
      estagiario.data_fim_estagio = DateTime.now()
    }

    await estagiario.save()
  }

  async emitirCertificado(id: number): Promise<void> {
    const estagiario = await Estagiario.findOrFail(id)
    estagiario.certificado_emitido = true
    estagiario.data_emissao_certificado = DateTime.now()
    await estagiario.save()
  }

  async avaliarDesempenho(id: number, avaliacao: string): Promise<void> {
    const estagiario = await Estagiario.findOrFail(id)
    estagiario.avaliacao_desempenho = avaliacao
    await estagiario.save()
  }

  async getDocumentos(id: number) {
    const estagiario = await this.findById(id)

    return {
      declaracao_vinculo: estagiario.declaracao_vinculo,
      termo_compromisso: estagiario.termo_compromisso,
      plano_estagio_arquivo: estagiario.plano_estagio_arquivo,
      relatorio_arquivo: estagiario.relatorio_arquivo,
      certificado_arquivo: estagiario.certificado_arquivo,
      certificado_emitido: estagiario.certificado_emitido,
      data_emissao_certificado: estagiario.data_emissao_certificado
    }
  }

  async gerarRelatorio(id: number) {
    // First, load the estagiario with all necessary relationships
    const estagiario = await Estagiario.query()
      .where('id', id)
      .preload('departamento')
      .preload('empresa')
      .preload('supervisor')
      .preload('projeto')
      .firstOrFail();

    const duracaoEstagio = estagiario.data_fim_estagio && estagiario.data_inicio_estagio
      ? estagiario.data_fim_estagio.diff(estagiario.data_inicio_estagio, 'days').days
      : null;

    const custoTotal = (estagiario.bolsa_auxilio || 0) +
      (estagiario.auxilio_transporte || 0) +
      (estagiario.auxilio_alimentacao || 0);

    return {
      estagiario: {
        id: estagiario.id,
        nome: estagiario.nome,
        curso: estagiario.curso,
        instituicao_ensino: estagiario.instituicao_ensino,
        nivel_academico: estagiario.nivel_academico,
        status_estagio: estagiario.status_estagio,
        supervisor: estagiario.supervisor?.nome || '',
        adicionar_remuneracao: estagiario.adicionar_remuneracao,
        departamento: estagiario.departamento?.nome || '',
        empresa: estagiario.empresa?.nome || '',
        projeto: estagiario.projeto?.nome || '',
        data_inicio_estagio: estagiario.data_inicio_estagio,
        data_fim_estagio: estagiario.data_fim_estagio,
        tipo_estagio: estagiario.tipo_estagio,
        bolsa_auxilio: estagiario.bolsa_auxilio,
        avaliacao_desempenho: estagiario.avaliacao_desempenho,
        certificado_emitido: estagiario.certificado_emitido
      },
      metricas: {
        duracao_dias: duracaoEstagio,
        custo_total: custoTotal,
        custo_mensal: custoTotal,
        status_atual: estagiario.status_estagio,
        possui_certificado: estagiario.certificado_emitido
      }
    };
  }

  async findBySupervisor(supervisorId: number) {
    return await Estagiario.query()
      .where('id_supervisor', supervisorId)
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }

  async findByDepartamento(departamentoId: number) {
    return await Estagiario.query()
      .where('id_departamento', departamentoId)
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }

  async findByProjeto(projetoId: number) {
    return await Estagiario.query()
      .where('id_projeto', projetoId)
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }

  async findByEmpresa(empresaId: number) {
    return await Estagiario.query()
      .where('id_empresa', empresaId)
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }

  async getEstagiariosConcluidos() {
    return await Estagiario.query()
      .where('status_estagio', 'concluido')
      .where('certificado_emitido', false)
      .preload('empresa')
      .preload('departamento')
      .preload('supervisor')
      .preload('projeto')
  }
}
