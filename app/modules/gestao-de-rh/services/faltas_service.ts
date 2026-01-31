import Falta from '#models/falta';
import Colaborador from '../models/Colaborador.js';
import { DateTime } from 'luxon';

export default class FaltasService {
 constructor() {}

    public async list() {
      return await Falta.all()
    }
  
  /**
   * Obtém estatísticas detalhadas de faltas
   */
  async getEstatisticasDetalhadas(filtros: {
    data_inicio?: string;
    data_fim?: string;
    colaborador_id?: number;
    empresa_id?: number;
    departamento_id?: number;
  } = {}) {
    let query = Falta.query().preload('colaborador');

    // Aplicar filtros
    if (filtros.data_inicio && filtros.data_fim) {
      query = query
        .where('data_inicio', '>=', filtros.data_inicio)
        .where('data_fim', '<=', filtros.data_fim);
    }

    if (filtros.colaborador_id) {
      query = query.where('colaborador_id', filtros.colaborador_id);
    }

    if (filtros.empresa_id) {
      query = query.whereHas('colaborador', (colabQuery) => {
        colabQuery.where('id_empresa', filtros.empresa_id!);
      });
    }

    if (filtros.departamento_id) {
      query = query.whereHas('colaborador', (colabQuery) => {
        colabQuery.where('id_departamento', filtros.departamento_id!);
      });
    }

    const faltas = await query.exec();

    // Calcular estatísticas detalhadas
    const estatisticas = {
      total: faltas.length,
      total_dias: faltas.reduce((sum, f) => sum + f.duracao, 0),
      por_estado: {
        pendentes: faltas.filter(f => f.estado === 'pendente').length,
        aprovados: faltas.filter(f => f.estado === 'aprovado').length,
        rejeitados: faltas.filter(f => f.estado === 'rejeitado').length
      },
      por_tipo: {
        ferias: faltas.filter(f => f.tipo === 'ferias').length,
        licenca_medica: faltas.filter(f => f.tipo === 'licenca_medica').length,
        viagem_trabalho: faltas.filter(f => f.tipo === 'viagem_trabalho').length,
        home_office: faltas.filter(f => f.tipo === 'home_office').length,
        teletrabalho: faltas.filter(f => f.tipo === 'teletrabalho').length,
        falta_justificada: faltas.filter(f => f.tipo === 'falta_justificada').length,
        falta_injustificada: faltas.filter(f => f.tipo === 'falta_injustificada').length,
        licenca_maternidade: faltas.filter(f => f.tipo === 'licenca_maternidade').length,
        licenca_paternidade: faltas.filter(f => f.tipo === 'licenca_paternidade').length,
        formacao: faltas.filter(f => f.tipo === 'formacao').length,
        missao_servico: faltas.filter(f => f.tipo === 'missao_servico').length,
        baixa_medica: faltas.filter(f => f.tipo === 'baixa_medica').length,
        luto: faltas.filter(f => f.tipo === 'luto').length,
        dispensa: faltas.filter(f => f.tipo === 'dispensa').length,
        outros: faltas.filter(f => f.tipo === 'outros').length
      },
      por_mes: this.agruparPorMes(faltas),
      top_colaboradores: this.getTopColaboradores(faltas),
      impacto_produtividade: this.calcularImpactoProdutividade(faltas)
    };

    return estatisticas;
  }

  /**
   * Agrupa faltas por mês
   */
  private agruparPorMes(faltas: any[]) {
    const agrupado: { [key: string]: number } = {};
    
    faltas.forEach(falta => {
      const mes = DateTime.fromISO(falta.data_inicio).toFormat('yyyy-MM');
      agrupado[mes] = (agrupado[mes] || 0) + 1;
    });

    return agrupado;
  }

  /**
   * Obtém os colaboradores com mais faltas
   */
  private getTopColaboradores(faltas: any[], limite: number = 10) {
    const contagem: { [key: string]: { nome: string; total: number; dias: number } } = {};
    
    faltas.forEach(falta => {
      const colabId = falta.colaborador_id;
      const colabNome = falta.colaborador?.nome || 'Desconhecido';
      
      if (!contagem[colabId]) {
        contagem[colabId] = { nome: colabNome, total: 0, dias: 0 };
      }
      
      contagem[colabId].total += 1;
      contagem[colabId].dias += falta.duracao;
    });

    return Object.values(contagem)
      .sort((a, b) => b.total - a.total)
      .slice(0, limite);
  }

  /**
   * Calcula o impacto na produtividade
   */
  private calcularImpactoProdutividade(faltas: any[]) {
    const diasUteisNoMes = 22; // Média de dias úteis
    const totalColaboradores = new Set(faltas.map(f => f.colaborador_id)).size;
    const totalDiasPerdidos = faltas.reduce((sum, f) => sum + f.duracao, 0);
    
    const diasTrabalhoPossiveis = totalColaboradores * diasUteisNoMes;
    const percentualImpacto = diasTrabalhoPossiveis > 0 ? (totalDiasPerdidos / diasTrabalhoPossiveis) * 100 : 0;

    return {
      total_dias_perdidos: totalDiasPerdidos,
      dias_trabalho_possiveis: diasTrabalhoPossiveis,
      percentual_impacto: Math.round(percentualImpacto * 100) / 100,
      nivel_impacto: this.classificarImpacto(percentualImpacto)
    };
  }

  /**
   * Classifica o nível de impacto
   */
  private classificarImpacto(percentual: number): string {
    if (percentual < 5) return 'Baixo';
    if (percentual < 10) return 'Moderado';
    if (percentual < 20) return 'Alto';
    return 'Crítico';
  }

  /**
   * Gera relatório de faltas para exportação
   */
  async gerarRelatorio(filtros: any = {}) {
    let query = Falta.query()
      .preload('colaborador', (colaboradorQuery) => {
        colaboradorQuery.preload('departamento')
      })
      .orderBy('data_inicio', 'desc');

    // Aplicar filtros
    if (filtros.data_inicio && filtros.data_fim) {
      query = query
        .where('data_inicio', '>=', filtros.data_inicio)
        .where('data_fim', '<=', filtros.data_fim);
    }

    if (filtros.estado) {
      query = query.where('estado', filtros.estado);
    }

    if (filtros.tipo) {
      query = query.where('tipo', filtros.tipo);
    }

    if (filtros.colaborador_id) {
      query = query.where('colaborador_id', filtros.colaborador_id);
    }

    const faltas = await query.exec();

    return faltas.map(falta => ({
      id: falta.id,
      colaborador: falta.colaborador?.nome || 'N/A',
      colaborador_bi: falta.colaborador?.bi || 'N/A',
      departamento: falta.colaborador?.departamento?.nomeDepartamento || 'N/A',
      tipo: falta.getTipoLabel(),
      data_inicio: falta.data_inicio,
      data_fim: falta.data_fim,
      data_referencia: falta.data_referencia,
      duracao: falta.duracao,
      estado: falta.getEstadoLabel(),
      descricao: falta.descricao || '-',
      motivo_rejeicao: falta.motivo_rejeicao || '-',
      criado_em: falta.createdAt.toFormat('dd/MM/yyyy HH:mm'),
      atualizado_em: falta.updatedAt.toFormat('dd/MM/yyyy HH:mm')
    }));
  }

  /**
   * Verifica conflitos de faltas
   */
  async verificarConflitos(colaboradorId: number, dataInicio: string, dataFim: string, faltaId?: number) {
    const query = Falta.query()
      .where('colaborador_id', colaboradorId)
      .where('estado', 'aprovado')
      .where((query) => {
        query
          .where('data_inicio', '<=', dataFim)
          .where('data_fim', '>=', dataInicio);
      });

    // Excluir a própria falta se for uma atualização
    if (faltaId) {
      query.where('id', '!=', faltaId);
    }

    const conflitos = await query.exec();
    return conflitos;
  }

  /**
   * Obtém faltas pendentes para aprovação
   */
  async getFaltasPendentes(aprovadorId?: number) {
    let query = Falta.query()
      .where('estado', 'pendente')
      .preload('colaborador')
      .orderBy('created_at', 'asc');

    // Se houver um aprovador específico, filtrar por permissões
    if (aprovadorId) {
      // Aqui você pode adicionar lógica para filtrar por permissões do aprovador
      // Por exemplo, apenas faltas do seu departamento
    }

    return await query.exec();
  }

  /**
   * Elimina faltas de um colaborador em um mês e ano específicos
   * Apenas elimina faltas justificadas e não justificadas
   */
  async eliminarFaltasPorColaboradorMesAno(colaboradorId: number, mes: number, ano: number): Promise<number> {
    const faltasParaEliminar = await Falta.query()
      .where('colaborador_id', colaboradorId)
      .where('tipo', 'in', ['falta_justificada', 'falta_injustificada'])
      .where((query) => {
        query
          .whereRaw('MONTH(data_inicio) = ?', [mes])
          .whereRaw('YEAR(data_inicio) = ?', [ano]);
      })
      .exec();

    if (faltasParaEliminar.length === 0) {
      return 0;
    }

    // Eliminar as faltas encontradas
    const idsParaEliminar = faltasParaEliminar.map(falta => falta.id);
    const result = await Falta.query().whereIn('id', idsParaEliminar).delete();

    return result.length || 0;
  }

  /**
   * Elimina todas as faltas justificadas e não justificadas de um mês e ano
   */
  async eliminarFaltasPorMesAno(mes: number, ano: number): Promise<number> {
    const faltasParaEliminar = await Falta.query()
      .where('tipo', 'in', ['falta_justificada', 'falta_injustificada'])
      .where((query) => {
        query
          .whereRaw('MONTH(data_inicio) = ?', [mes])
          .whereRaw('YEAR(data_inicio) = ?', [ano]);
      })
      .exec();

    if (faltasParaEliminar.length === 0) {
      return 0;
    }

    // Eliminar as faltas encontradas
    const idsParaEliminar = faltasParaEliminar.map(falta => falta.id);
    const result = await Falta.query().whereIn('id', idsParaEliminar).delete();

    return result.length || 0;
  }

  /**
   * Valida regras de negócio para criação de falta
   */
  async validarRegrasNegocio(dados: any) {
    const erros: string[] = [];

    // Verificar se o colaborador existe e está ativo
    const colaborador = await Colaborador.find(dados.colaborador_id);
    if (!colaborador) {
      erros.push('Colaborador não encontrado');
    } else if (colaborador.estado !== 'ativo') {
      erros.push('Apenas colaboradores ativos podem registrar faltas');
    }

    // Verificar conflitos com outras faltas aprovadas
    const conflitos = await this.verificarConflitos(
      dados.colaborador_id,
      dados.data_inicio,
      dados.data_fim
    );

    if (conflitos.length > 0) {
      erros.push('Existe(m) falta(s) aprovada(s) no mesmo período');
    }

    // Validar datas
    const dataInicio = DateTime.fromISO(dados.data_inicio);
    const dataFim = DateTime.fromISO(dados.data_fim);

    if (!dataInicio.isValid || !dataFim.isValid) {
      erros.push('Datas inválidas');
    }

    if (dataInicio > dataFim) {
      erros.push('Data de início não pode ser posterior à data fim');
    }

    // Validar tipo
    const tiposValidos = Object.values(Falta.TIPOS);
    if (!tiposValidos.includes(dados.tipo)) {
      erros.push('Tipo de falta inválido');
    }

    return {
      valido: erros.length === 0,
      erros
    };
  }
}
