import ModeloFaturaBanco from '../models/ModeloFaturaBanco.js'
import { Exception } from '@adonisjs/core/exceptions'

export default class ModeloFaturaBancoService {
  async listAll(page: number = 1, limit: number = 10) {
    return await ModeloFaturaBanco.query()
      .preload('banco')
      .preload('modeloFactura')
      .paginate(page, limit)
  }

  async findById(id: number) {
    const modeloFaturaBanco = await ModeloFaturaBanco.query()
      .where('id', id)
      .preload('banco')
      .preload('modeloFactura')
      .first()

    if (!modeloFaturaBanco) {
      throw new Exception('Modelo de fatura banco não encontrado', { status: 404 })
    }

    return modeloFaturaBanco
  }

  async create(data: Partial<ModeloFaturaBanco>) {
    try {
      return await ModeloFaturaBanco.create(data)
    } catch (error) {
      console.error('Erro ao criar modelo de fatura banco:', error)
      throw error
    }
  }

  async update(id: number, data: Partial<ModeloFaturaBanco>) {
    const modeloFaturaBanco = await ModeloFaturaBanco.findOrFail(id)
    
    try {
      modeloFaturaBanco.merge(data)
      await modeloFaturaBanco.save()
      return modeloFaturaBanco
    } catch (error) {
      console.error('Erro ao atualizar modelo de fatura banco:', error)
      throw error
    }
  }

  async delete(id: number) {
    const modeloFaturaBanco = await ModeloFaturaBanco.findOrFail(id)
    
    try {
      await modeloFaturaBanco.delete()
      return { success: true }
    } catch (error) {
      console.error('Erro ao remover modelo de fatura banco:', error)
      throw error
    }
  }

  async findByModeloFacturaId(modeloFacturaId: number) {
    return await ModeloFaturaBanco.query()
      .where('modelos_factura_id', modeloFacturaId)
      .preload('banco')
      .exec()
  }
}
