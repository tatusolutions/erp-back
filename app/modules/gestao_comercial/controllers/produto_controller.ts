import type { HttpContext } from '@adonisjs/core/http'
import ProdutoService from '../services/produto_service.js'

export default class ProdutoController {
  constructor(private service = new ProdutoService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
    return response.status(200).json({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.status(200).json({ data })
  }

  // async store({ request, response }: HttpContext) {
  //   await this.service.create(request.all())
  //   return response.status(201).json({
  //     data: {
  //       message: 'Produto criado com sucesso',
  //     },
  //   })
  // }
  private async parsePreco(preco: string | number) {
    if (typeof preco === 'string') {
      return Number.parseFloat(preco.replace(/\./g, '').replace(',', '.'))
    }
    return preco
  }

  async store({ request, response }: HttpContext) {
    const data = request.all()
  
    // Converte strings numéricas para float corretamente
    const parsePreco = (preco: any) => {
      if (typeof preco === 'string') {
        return Number.parseFloat(preco.replace(/\./g, '').replace(',', '.')) || 0
      }
      if (typeof preco === 'object' || preco === null || preco === undefined) {
        return 0
      }
      return preco
    }
  
    data.custo = parsePreco(data.custo)
    data.preco_custo = parsePreco(data.preco_custo)
    data.preco_venda = parsePreco(data.preco_venda)
  
    // Garante que campos booleanos sejam coerentes
    data.tem_categoria = !!data.tem_categoria
    data.tem_marca = !!data.tem_marca
    data.tem_variacao = !!data.tem_variacao
    data.preco_com_iva = !!data.preco_com_iva
  
    // Agora sim, envia os dados tratados
    await this.service.create(data)
  
    return response.status(201).json({
      data: { message: 'Produto criado com sucesso' },
    })
  }
  

  async show({ params, response }: HttpContext) {
    const produto = await this.service.findById(params.id)
    return response.ok(produto)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.all())
    return response.status(201).json({
      data: {
        message: 'Produto editado com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }
}