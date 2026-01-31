import type { HttpContext } from '@adonisjs/core/http'
import ColaboradorService from '../services/colaborador_service.js'

export default class ColaboradorsController {
  constructor(private service = new ColaboradorService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const data = await this.service.listAll(page, limit, search)
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
        message: 'Colaborador criado com sucesso',
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
        message: 'Colaborador atualizado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }

  public async temFolha({ params, response }: HttpContext) {
    try {
      console.log(`🔍 [CONTROLLER] Recebida requisição para verificar folha do colaborador ID: ${params.id}`);
      
      const temFolha = await this.service.verificarFolhaColaborador(params.id)
      console.log(`📋 [CONTROLLER] Resultado do serviço: ${temFolha}`);
      
      return response.json({
        data: { temFolha }
      })
    } catch (error) {
      console.error('Erro ao verificar folha do colaborador:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao verificar folha do colaborador'
      })
    }
  }

  public async desvincular({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'desvinculado')
      return response.json({
        status: 'success',
        message: 'Colaborador desvinculado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao desvincular colaborador:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao desvincular colaborador'
      })
    }
  }

  public async suspender({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'suspenso')
      return response.json({
        status: 'success',
        message: 'Colaborador suspenso com sucesso'
      })
    } catch (error) {
      console.error('Erro ao suspender colaborador:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao suspender colaborador'
      })
    }
  }

  public async getEmpresa({ params, response }: HttpContext) {
    try {
      const empresa = await this.service.getEmpresaByColaboradorId(params.id)
      return response.ok(empresa)
    } catch (error) {
      console.error('Erro ao buscar empresa do colaborador:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar empresa do colaborador'
      })
    }
  }

  public async ativar({ params, response }: HttpContext) {
    try {
      await this.service.atualizarStatus(params.id, 'ativo')
      return response.json({
        status: 'success',
        message: 'Colaborador ativado com sucesso'
      })
    } catch (error) {
      console.error('Erro ao ativar colaborador:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao ativar colaborador'
      })
    }
  }
}
