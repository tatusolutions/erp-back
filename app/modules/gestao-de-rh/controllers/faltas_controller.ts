import type { HttpContext } from '@adonisjs/core/http';
import Falta from '../models/falta.js';
import { DateTime } from 'luxon';
import FaltasService from '../services/faltas_service.js';
import FolhaSalarioService from '../services/folha_salario_service.js';

export default class FaltasController {
  constructor(
    private service = new FaltasService(),
    private folhaSalarioService = new FolhaSalarioService()
  ) {}
  
  /**
   * Lista todas as faltas com filtros opcionais
   */
  public async index({ request, response }: HttpContext) {
    try {
      const page = request.input('page', 1);
      const perPage = request.input('perPage', 10);
      const search = request.input('search', '');
      const isPaginate = request.input('isPaginate', '1');
      const estado = request.input('estado');
      const tipo = request.input('tipo');
      const colaboradorId = request.input('colaborador_id');
      const dataInicio = request.input('data_inicio');
      const dataFim = request.input('data_fim');

      // Construir query
      let query = Falta.query().preload('colaborador');

      // Aplicar filtros
      if (search) {
        query = query.whereHas('colaborador', (colabQuery) => {
          colabQuery.where('nome', 'LIKE', `%${search}%`);
        });
      }

      if (estado) {
        query = query.where('estado', estado);
      }

      if (tipo) {
        query = query.where('tipo', tipo);
      }

      if (colaboradorId) {
        query = query.where('colaborador_id', colaboradorId);
      }

      if (dataInicio && dataFim) {
        query = query
          .where('data_inicio', '>=', dataInicio)
          .where('data_fim', '<=', dataFim);
      } else if (dataInicio) {
        query = query.where('data_inicio', '>=', dataInicio);
      } else if (dataFim) {
        query = query.where('data_fim', '<=', dataFim);
      }

      // Ordenação
      query = query.orderBy('created_at', 'desc');

      // Paginação ou lista completa
      if (isPaginate === '1') {
        const faltas = await query.paginate(page, perPage);
        return response.json({
          data: faltas.serialize(),
          meta: faltas.serialize().meta
        });
      } else {
        const faltas = await query.exec();
        return response.json({
          data: faltas.map(falta => falta.serialize())
        });
      }
    } catch (error) {
      console.error('Erro ao listar faltas:', error);
      return response.status(500).json({
        message: 'Erro ao listar faltas',
        error: error.message
      });
    }
  }

  public async list({ request, response }: HttpContext) {
    try {
      const { data_inicio, data_fim, isPaginate = '1' } = request.all()

      const query = Falta.query()
        .preload('colaborador')
        .orderBy('data_inicio', 'desc')

      // Aplicar filtro por data se fornecido
      if (data_inicio && data_fim) {
        query.whereBetween('data_inicio', [data_inicio, data_fim])
      }

      // Se for para paginar
      if (isPaginate === '1') {
        const page = request.input('page', 1)
        const perPage = request.input('per_page', 10)
        const faltas = await query.paginate(page, perPage)

        return response.ok({
          data: faltas.all(),
          meta: faltas.getMeta()
        })
      }

      // Se não for para paginar
      const faltas = await query.exec()
      return response.ok({
        data: faltas
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao listar as faltas',
        error: error.message
      })
    }
  }
  /**
   * Exibe uma falta específica
   */
  public async show({ params, response }: HttpContext) {
    try {
      const falta = await Falta.query()
        .where('id', params.id)
        .preload('colaborador')
        .first();

      if (!falta) {
        return response.status(404).json({
          message: 'Falta não encontrada'
        });
      }

      return response.json({
        data: falta.serialize()
      });
    } catch (error) {
      console.error('Erro ao buscar falta:', error);
      return response.status(500).json({
        message: 'Erro ao buscar falta',
        error: error.message
      });
    }
  }

  /**
   * Elimina faltas de um colaborador em um mês e ano específicos
   */
  public async eliminarPorColaboradorMesAno({ params, response }: HttpContext) {
    try {
      const { colaboradorId, mes, ano } = params;

      if (!colaboradorId || !mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'ID do colaborador, mês e ano são obrigatórios'
        });
      }

      const faltasEliminadas = await this.service.eliminarFaltasPorColaboradorMesAno(
        Number(colaboradorId),
        Number(mes),
        Number(ano)
      );

      return response.json({
        status: 'success',
        message: `${faltasEliminadas} falta(s) eliminada(s) com sucesso`,
        data: {
          faltasEliminadas
        }
      });
    } catch (error) {
      console.error('Erro ao eliminar faltas do colaborador:', error);
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao eliminar faltas do colaborador'
      });
    }
  }

  /**
   * Elimina todas as faltas de um mês e ano
   */
  public async eliminarPorMesAno({ params, response }: HttpContext) {
    try {
      const { mes, ano } = params;

      if (!mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Mês e ano são obrigatórios'
        });
      }

      const faltasEliminadas = await this.service.eliminarFaltasPorMesAno(
        Number(mes),
        Number(ano)
      );

      return response.json({
        status: 'success',
        message: `${faltasEliminadas} falta(s) eliminada(s) com sucesso`,
        data: {
          faltasEliminadas
        }
      });
    } catch (error) {
      console.error('Erro ao eliminar faltas do período:', error);
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao eliminar faltas do período'
      });
    }
  }

  /**
   * Cria uma nova falta
   */
  public async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'colaborador_id',
        'data_inicio',
        'data_fim',
        'data_referencia',
        'tipo',
        'descricao',
        'duracao',
        'estado'
      ]);

      // Validações básicas
      if (!data.colaborador_id || !data.data_inicio || !data.data_fim || !data.tipo) {
        return response.status(400).json({
          message: 'Campos obrigatórios: colaborador_id, data_inicio, data_fim, tipo'
        });
      }

      // Validar datas
      const dataInicio = DateTime.fromISO(data.data_inicio);
      const dataFim = DateTime.fromISO(data.data_fim);

      if (!dataInicio.isValid || !dataFim.isValid) {
        return response.status(400).json({
          message: 'Datas inválidas'
        });
      }

      if (dataInicio > dataFim) {
        return response.status(400).json({
          message: 'Data de início não pode ser posterior à data fim'
        });
      }

      // Calcular duração se não fornecida
      if (!data.duracao) {
        const diffDays = dataFim.diff(dataInicio, 'days').days + 1;
        data.duracao = diffDays;
      }

      // Definir estado padrão como pendente
      data.estado = data.estado || 'pendente';
      data.data_referencia = data.data_referencia || data.data_inicio;

      // Criar um único registro com o período completo
      const falta = await Falta.create({
        colaborador_id: data.colaborador_id,
        tipo: data.tipo,
        descricao: data.descricao,
        estado: data.estado,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim,
        data_referencia: data.data_referencia,
        duracao: data.duracao
      });

      // Carregar os dados do colaborador
      await falta.load('colaborador');

      return response.status(201).json({
        message: 'Falta registrada com sucesso',
        data: falta
      });

    } catch (error) {
      console.error('Erro ao registrar falta:', error);
      return response.status(500).json({
        message: 'Erro ao registrar falta',
        error: error.message
      });
    }
  }
  /**
   * Atualiza uma falta existente
   */
  public async update({ params, request, response }: HttpContext) {
    try {
      const falta = await Falta.find(params.id);

      if (!falta) {
        return response.status(404).json({
          message: 'Falta não encontrada'
        });
      }

      const data = request.only([
        'data_inicio',
        'data_fim',
        'tipo',
        'descricao',
        'estado',
        'motivo_rejeicao',
        'duracao'
      ]);

      // Validações para atualização
      if (data.data_inicio || data.data_fim) {
        const dataInicio = data.data_inicio ? DateTime.fromISO(data.data_inicio) : DateTime.fromISO(falta.data_inicio);
        const dataFim = data.data_fim ? DateTime.fromISO(data.data_fim) : DateTime.fromISO(falta.data_fim);

        if (dataInicio > dataFim) {
          return response.status(400).json({
            message: 'Data de início não pode ser posterior à data fim'
          });
        }

        // Recalcular duração
        const diffDays = dataFim.diff(dataInicio, 'days').days + 1;
        data.duracao = diffDays;
      }

      // Não permitir alteração de estado se não for pendente
      if (falta.estado !== 'pendente' && data.estado && data.estado !== falta.estado) {
        return response.status(400).json({
          message: 'Não é possível alterar o estado de uma falta que não está pendente'
        });
      }

      await falta.merge(data).save();
      await falta.load('colaborador');

      return response.json({
        message: 'Falta atualizada com sucesso',
        data: falta.serialize()
      });
    } catch (error) {
      console.error('Erro ao atualizar falta:', error);
      return response.status(500).json({
        message: 'Erro ao atualizar falta',
        error: error.message
      });
    }
  }

  /**
   * Exclui uma falta
   */
  public async destroy({ params, response }: HttpContext) {
    try {
      const falta = await Falta.find(params.id);

      if (!falta) {
        return response.status(404).json({
          message: 'Falta não encontrada'
        });
      }

      // Não permitir exclusão se não estiver pendente
      if (falta.estado !== 'pendente') {
        return response.status(400).json({
          message: 'Não é possível excluir uma falta que não está pendente'
        });
      }

      await falta.delete();

      return response.json({
        message: 'Falta excluída com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir falta:', error);
      return response.status(500).json({
        message: 'Erro ao excluir falta',
        error: error.message
      });
    }
  }

  /**
   * Aprova uma falta
   */
  public async aprovar({ params, request, response }: HttpContext) {
    try {
      const falta = await Falta.find(params.id);

      if (!falta) {
        return response.status(404).json({
          message: 'Falta não encontrada'
        });
      }

      if (falta.estado !== 'pendente') {
        return response.status(400).json({
          message: 'Apenas faltas pendentes podem ser aprovadas'
        });
      }

      const { aprovado_por } = request.only(['aprovado_por']);

      if (!aprovado_por) {
        return response.status(400).json({
          message: 'ID do aprovador é obrigatório'
        });
      }

      falta.aprovar(aprovado_por);
      await falta.save();
      await falta.load('colaborador');

      // Recalcular salário se for falta justificada ou não justificada
      if (falta.tipo === 'falta_justificada' || falta.tipo === 'falta_injustificada') {
        try {
          console.log(`🔄 [DEBUG] Iniciando recálculo de salário para falta ${falta.id} do tipo ${falta.tipo}`);
          
          await this.folhaSalarioService.recalcularSalarioPorFaltaAprovada(
            falta.colaborador_id,
            falta.data_inicio
          );
          
          console.log(`✅ [DEBUG] Recálculo de salário concluído com sucesso`);
        } catch (error) {
          console.error('❌ [DEBUG] Erro ao recalcular salário:', error);
          // Não falhar a aprovação da falta se o recálculo falhar
          // Mas registrar o erro para análise posterior
        }
      }

      return response.json({
        message: 'Falta aprovada com sucesso',
        data: falta.serialize()
      });
    } catch (error) {
      console.error('Erro ao aprovar falta:', error);
      return response.status(500).json({
        message: 'Erro ao aprovar falta',
        error: error.message
      });
    }
  }

  /**
   * Rejeita uma falta
   */
  public async rejeitar({ params, request, response }: HttpContext) {
    try {
      const falta = await Falta.find(params.id);

      if (!falta) {
        return response.status(404).json({
          message: 'Falta não encontrada'
        });
      }

      if (falta.estado !== 'pendente') {
        return response.status(400).json({
          message: 'Apenas faltas pendentes podem ser rejeitadas'
        });
      }

      const { aprovado_por, motivo_rejeicao } = request.only(['aprovado_por', 'motivo_rejeicao']);

      if (!aprovado_por) {
        return response.status(400).json({
          message: 'ID do aprovador é obrigatório'
        });
      }

      if (!motivo_rejeicao) {
        return response.status(400).json({
          message: 'Motivo da rejeição é obrigatório'
        });
      }

      falta.rejeitar(aprovado_por, motivo_rejeicao);
      await falta.save();
      await falta.load('colaborador');

      return response.json({
        message: 'Falta rejeitada com sucesso',
        data: falta.serialize()
      });
    } catch (error) {
      console.error('Erro ao rejeitar falta:', error);
      return response.status(500).json({
        message: 'Erro ao rejeitar falta',
        error: error.message
      });
    }
  }
  public async byColaborador({ params, response }: HttpContext) {
    try {
      const { id_colaborador } = params;
      const faltas = await Falta.query()
        .where('colaborador_id', id_colaborador)
        .orderBy('data_falta', 'desc');

      return response.ok(faltas);
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar faltas do colaborador',
        error: error.message
      });
    }
  }
  /**
   * Obtém estatísticas de faltas
   */
  public async estatisticas({ request, response }: HttpContext) {
    try {
      const dataInicio = request.input('data_inicio');
      const dataFim = request.input('data_fim');
      const colaboradorId = request.input('colaborador_id');

      let query = Falta.query();

      if (dataInicio && dataFim) {
        query = query
          .where('data_inicio', '>=', dataInicio)
          .where('data_fim', '<=', dataFim);
      }

      if (colaboradorId) {
        query = query.where('colaborador_id', colaboradorId);
      }

      const faltas = await query.exec();

      const estatisticas = {
        total: faltas.length,
        por_estado: {
          pendentes: faltas.filter(f => f.estado === 'pendente').length,
          aprovados: faltas.filter(f => f.estado === 'aprovado').length,
          rejeitados: faltas.filter(f => f.estado === 'rejeitado').length
        },
        por_tipo: {
          ferias: faltas.filter(f => f.tipo === 'ferias').length,
          licenca_medica: faltas.filter(f => f.tipo === 'licenca_medica').length,
          outros: faltas.filter(f => !['ferias', 'licenca_medica'].includes(f.tipo)).length
        },
        total_dias: faltas.reduce((sum, f) => sum + f.duracao, 0)
      };

      return response.json({
        data: estatisticas
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return response.status(500).json({
        message: 'Erro ao obter estatísticas',
        error: error.message
      });
    }
  }
}
