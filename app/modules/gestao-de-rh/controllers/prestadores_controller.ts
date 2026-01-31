import type { HttpContext } from '@adonisjs/core/http'
import PrestadorService from '../services/prestador_service.js'

export default class PrestadoresController {
  constructor(private service = new PrestadorService()) { }

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const estado = request.input('estado', '')
    const data = await this.service.listAll(page, limit, search, estado)
    return response.ok({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.ok({ data })
  }

  async store({ request, response }: HttpContext) {
    try {
      const data = request.all()
      console.log('📝 Data received in store:', data)
      await this.service.create(data)
      return response.created({
        data: {
          message: 'Prestador criado com sucesso',
        },
      })
    } catch (error) {
      console.error('❌ Error in store:', error)
      return response.badRequest({
        errors: [{
          message: 'Erro ao criar prestador',
          details: error.message
        }]
      })
    }
  }

  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.ok({ data })
  }

  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()
      console.log('📝 Data received in update:', data)
      await this.service.update(params.id, data)
      return response.ok({
        data: {
          message: 'Prestador atualizado com sucesso',
        },
      })
    } catch (error) {
      console.error('❌ Error in update:', error)
      return response.badRequest({
        errors: [{
          message: 'Erro ao atualizar prestador',
          details: error.message
        }]
      })
    }
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.ok({
      data: {
        message: 'Prestador excluído com sucesso',
      },
    })
  }

  // Adicione estes métodos na classe PrestadoresController

  public async getHistoricoPagamentos({ params, response }: HttpContext) {
    try {
      const { id } = params
      const historico = await this.service.getHistoricoPagamentos(Number(id))
      return response.ok({ data: historico })
    } catch (error) {
      console.error('Erro ao buscar histórico de pagamentos:', error)
      return response.status(500).json({
        error: 'Erro ao buscar histórico de pagamentos',
        details: error.message
      })
    }
  }

  public async verificarPagamentoExistente({ params, response }: HttpContext) {
    try {
      const { id, ano, mes } = params
      const pagamento = await this.service.verificarPagamentoExistente(id, ano, mes)
      return response.ok({ data: { existe: !!pagamento, pagamento } })
    } catch (error) {
      console.error('Erro ao verificar pagamento existente:', error)
      return response.status(500).json({
        error: 'Erro ao verificar pagamento existente',
        details: error.message
      })
    }
  }

  public async registrarPagamento({ request, response, params, auth }: HttpContext) {
    try {
      const { id } = params
      const data = request.only(['ano', 'mes', 'valor', 'data_pagamento', 'observacoes', 'empresa_id', 'usuario_id'])
      
      // Se os IDs não vierem no request, tenta obter do usuário autenticado
      if (!data.empresa_id || !data.usuario_id) {
        const user = await auth.authenticate()
        data.empresa_id = data.empresa_id || user.empresa_id
        data.usuario_id = data.usuario_id || user.id
      }

      const pagamento = await this.service.registrarPagamento({
        prestador_id: id,
        ...data
      })

      return response.created({ data: pagamento })
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error)
      
      // Verifica se o erro é de pagamento duplicado
      if (error.message.includes('Já existe um pagamento ativo para')) {
        return response.status(400).json({
          error: 'Erro ao registrar pagamento',
          message: error.message,
          details: error.message
        })
      }

      // Outros erros retornam 500
      return response.status(500).json({
        error: 'Erro ao registrar pagamento',
        details: error.message || 'Ocorreu um erro inesperado ao processar o pagamento'
      })
    }
  }

  async anularPagamento({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const { motivo } = request.only(['motivo'])
      
      if (!motivo) {
        return response.badRequest({
          error: 'Motivo obrigatório',
          details: 'É necessário informar o motivo da anulação'
        })
      }

      const pagamento = await this.service.anularPagamento(id, motivo)
      return response.ok({ 
        data: {
          message: 'Pagamento anulado com sucesso',
          pagamento
        }
      })
    } catch (error) {
      console.error('Erro ao anular pagamento:', error)
      return response.status(500).json({
        error: 'Erro ao anular pagamento',
        details: error.message || 'Ocorreu um erro ao tentar anular o pagamento'
      })
    }
  }
}
