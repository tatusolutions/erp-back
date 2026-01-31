import { HttpContext } from '@adonisjs/core/http'
import ProjetoService from '../services/projeto_service.js'
import Projeto from '../models/Projeto.js'
import Estagiario from '../models/Estagiario.js'

export default class ProjetosController {
  constructor(private service = new ProjetoService()) { }

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const status = request.input('status', '')
    const data = await this.service.listAll(page, limit, search, status)
    return response.ok({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.ok({ data })
  }

  async store({ request, response }: HttpContext) {
    await this.service.create(request.all())
    return response.created({
      data: {
        message: 'Projeto criado com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.ok(data)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.all())
    return response.ok({
      data: {
        message: 'Projeto atualizado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    try {
      await this.service.delete(params.id)
      return response.noContent()
    } catch (error) {
      console.error('Erro ao excluir projeto:', error)

      if (error.message.includes('estagiário')) {
        return response.status(400).json({
          status: 'error',
          message: error.message
        })
      }

      return response.status(500).json({
        status: 'error',
        message: 'Erro ao excluir projeto'
      })
    }
  }

  async contarEstagiariosVinculados({ params, response }: HttpContext) {
    try {
      const projeto = await Projeto.findOrFail(params.id);

      // Option 1: Using first() to get the first result
      const result = await Estagiario.query()
        .where('id_projeto', params.id)
        .count('* as total')
        .first();

      const total = result ? Number(result.$extras.total) : 0;

      return response.ok({
        data: {
          projetoId: projeto.id,
          projetoNome: projeto.nome,
          totalEstagiarios: total
        }
      });
    } catch (error) {
      console.error('Erro ao contar estagiários vinculados:', error);
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao contar estagiários vinculados'
      });
    }
  }

  public async ativos({ response }: HttpContext) {
    try {
      const projetos = await this.service.getProjetosAtivos()
      return response.ok({ data: projetos })
    } catch (error) {
      console.error('Erro ao buscar projetos ativos:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar projetos ativos'
      })
    }
  }

  public async iniciar({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'em_andamento')
      return response.json({
        status: 'success',
        message: 'Projeto iniciado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao iniciar projeto:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao iniciar projeto'
      })
    }
  }

  public async pausar({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'pausado')
      return response.json({
        status: 'success',
        message: 'Projeto pausado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao pausar projeto:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao pausar projeto'
      })
    }
  }

  public async concluir({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'concluido')
      return response.json({
        status: 'success',
        message: 'Projeto concluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao concluir projeto:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao concluir projeto'
      })
    }
  }

  public async cancelar({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'cancelado')
      return response.json({
        status: 'success',
        message: 'Projeto cancelado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao cancelar projeto:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao cancelar projeto'
      })
    }
  }

  public async atualizarProgresso({ params, request, response }: HttpContext) {
    try {
      const { progresso } = request.all()
      await this.service.atualizarProgresso(params.id, progresso)
      return response.json({
        status: 'success',
        message: 'Progresso atualizado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao atualizar progresso'
      })
    }
  }

  public async relatorio({ params, response }: HttpContext) {
    try {
      const relatorio = await this.service.gerarRelatorio(params.id)
      return response.ok({ data: relatorio })
    } catch (error) {
      console.error('Erro ao gerar relatório:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao gerar relatório'
      })
    }
  }
}
