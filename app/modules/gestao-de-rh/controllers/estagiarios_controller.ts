import type { HttpContext } from '@adonisjs/core/http'
import EstagiarioService from '../services/estagiario_service.js'

export default class EstagiariosController {
  constructor(private service = new EstagiarioService()) {}

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
    const data = request.only([
      'id_empresa', 'user_id', 'nome', 'bi', 'email', 'endereco', 'funcao',
      'id_departamento', 'id_projeto', 'data_nascimento', 'telefone_principal',
      'telefone_alternativo', 'curso', 'data_inicio_estagio', 'data_fim_estagio',
      'status', 'supervisor', 'adicionar_remuneracao', 'associar_projeto'
    ])

    // Map instituicao to instituicao_ensino
    if (request.input('instituicao')) {
      data.instituicao_ensino = request.input('instituicao')
    }

    await this.service.create(data)
    return response.created({
      data: {
        message: 'Estagiário criado com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.ok(data)
  }

  async update({ params, request, response }: HttpContext) {
    const data = request.only([
      'id_empresa', 'user_id', 'nome', 'bi', 'email', 'endereco', 'funcao',
      'id_departamento', 'id_projeto', 'data_nascimento', 'telefone_principal',
      'telefone_alternativo', 'curso', 'data_inicio_estagio', 'data_fim_estagio',
      'status', 'supervisor', 'adicionar_remuneracao', 'associar_projeto'
    ])

    // Map instituicao to instituicao_ensino
    if (request.input('instituicao')) {
      data.instituicao_ensino = request.input('instituicao')
    }

    await this.service.update(params.id, data)
    return response.ok({
      data: {
        message: 'Estagiário atualizado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }

  public async ativos({ response }: HttpContext) {
    try {
      const estagiarios = await this.service.getEstagiariosAtivos()
      return response.ok({ data: estagiarios })
    } catch (error) {
      console.error('Erro ao buscar estagiários ativos:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar estagiários ativos'
      })
    }
  }

  public async iniciarEstagio({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatusEstagio(params.id, 'ativo')
      return response.json({
        status: 'success',
        message: 'Estágio iniciado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao iniciar estágio:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao iniciar estágio'
      })
    }
  }

  public async suspenderEstagio({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatusEstagio(params.id, 'suspenso')
      return response.json({
        status: 'success',
        message: 'Estágio suspenso com sucesso'
      })
    } catch (error) {
      console.error('Erro ao suspender estágio:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao suspender estágio'
      })
    }
  }

  public async concluirEstagio({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatusEstagio(params.id, 'concluido')
      return response.json({
        status: 'success',
        message: 'Estágio concluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao concluir estágio:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao concluir estágio'
      })
    }
  }

  public async cancelarEstagio({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatusEstagio(params.id, 'cancelado')
      return response.json({
        status: 'success',
        message: 'Estágio cancelado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao cancelar estágio:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao cancelar estágio'
      })
    }
  }

  public async emitirCertificado({ params, response }: HttpContext) {
    try {
      await this.service.emitirCertificado(params.id)
      return response.json({
        status: 'success',
        message: 'Certificado emitido com sucesso'
      })
    } catch (error) {
      console.error('Erro ao emitir certificado:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao emitir certificado'
      })
    }
  }

  public async avaliarDesempenho({ params, request, response }: HttpContext) {
    try {
      const { avaliacao } = request.all()
      await this.service.avaliarDesempenho(params.id, avaliacao)
      return response.json({
        status: 'success',
        message: 'Avaliação de desempenho registrada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao avaliar desempenho:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao avaliar desempenho'
      })
    }
  }

  public async documentos({ params, response }: HttpContext) {
    try {
      const documentos = await this.service.getDocumentos(params.id)
      return response.ok({ data: documentos })
    } catch (error) {
      console.error('Erro ao buscar documentos:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar documentos'
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
