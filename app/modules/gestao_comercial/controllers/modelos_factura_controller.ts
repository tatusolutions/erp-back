import type { HttpContext } from '@adonisjs/core/http'
import ModelosFactura from '../models/ModelosFactura.js'
import ModelosFacturaService from '../services/modelos_facturas_service.js'
import { cuid } from '@adonisjs/core/helpers'
import app from '@adonisjs/core/services/app'

type ModeloFacturaData = {
  nif: string
  nome: string
  email: string
  endereco: string
  telefone: string
  status: boolean
  tem_banco: boolean
  tem_marca_d_agua: boolean
  id_empresa: number
  id_usuario: number
  logotipo?: string
  bancos?: any[] // You might want to create a more specific type for bancos
}

export default class ModeloFacturaController {
  constructor(private service = new ModelosFacturaService()) { }

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

  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.ok(data)
  }


  public async store({ request, response }: HttpContext) {
    const trx = await ModelosFactura.transaction()

    try {
      // 1. Get all fields from the request
      const rawData = request.only([
        'nif', 'nome', 'email', 'endereco', 'telefone',
        'status', 'tem_banco', 'tem_marca_d_agua', 'bancos', 'id_empresa', 'id_usuario'
      ])

      // 2. Extract bancos from the data for later processing
      const bancos = rawData.bancos
      delete rawData.bancos

      // 3. Prepare the base model data with proper typing
      const modeloData: Omit<ModeloFacturaData, 'bancos'> & { logotipo?: string } = {
        ...rawData,
        status: rawData.status === 'true' || rawData.status === 1 || rawData.status === '1',
        tem_banco: rawData.tem_banco === 'true' || rawData.tem_banco === 1 || rawData.tem_banco === '1',
        tem_marca_d_agua: rawData.tem_marca_d_agua === 'true' || rawData.tem_marca_d_agua === 1 || rawData.tem_marca_d_agua === '1',
        logotipo: undefined // Initialize as undefined, will be set if file is uploaded
      }

      // 4. Handle file upload if present
      const logotipo = request.file('logotipo')
      if (logotipo) {
        const fileName = `${cuid()}.${logotipo.extname}`
        await logotipo.move(app.makePath('tmp/uploads'), {
          name: fileName,
          overwrite: true
        })
        modeloData.logotipo = fileName
      }

      // 5. First, create the ModeloFactura
      const modelo = await this.service.criarModeloFactura({
        ...modeloData,
        client: trx
      })

      // 6. Then, handle bancos relationship if provided
      if (bancos) {
        // Ensure we have the model ID before proceeding
        if (!modelo.id) {
          throw new Error('Falha ao criar o modelo de fatura: ID não gerado')
        }

        // Parse bancos if it's a string
        let bancosArray = bancos;
        if (typeof bancos === 'string') {
          try {
            bancosArray = JSON.parse(bancos);
          } catch (error) {
            console.error('Erro ao fazer parse dos bancos:', error);
            throw new Error('Formato inválido para os dados dos bancos');
          }
        }

        // Process and create bank associations if we have valid data
        if (Array.isArray(bancosArray) && bancosArray.length > 0) {
          await this.service.sincronizarBancos(modelo.id, bancosArray, trx);
          // Reload the model with the bancos relationship
          await modelo.load('bancos');
        }
      }

      // 7. Commit the transaction if everything is successful
      await trx.commit()

      return response.status(201).json({
        success: true,
        message: 'Modelo de fatura criado com sucesso',
        data: modelo
      })
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback()
      return response.status(500).json({
        error: 'Erro ao criar modelo de fatura',
        details: error.message
      })
    }
  }


  public async update({ params, request, response }: HttpContext) {
    const trx = await ModelosFactura.transaction()

    try {
      // 1. Get all fields from the request
      const rawData = request.only([
        'nif', 'nome', 'email', 'endereco', 'telefone',
        'status', 'tem_banco', 'tem_marca_d_agua', 'bancos', 'id_empresa', 'id_usuario'
      ])

      // 2. Extract bancos from the data for processing
      const bancos = rawData.bancos
      delete rawData.bancos

      // 3. Prepare the update data with proper typing
      const updateData: Partial<ModeloFacturaData> = {
        ...rawData,
        status: rawData.status === 'true' || rawData.status === 1 || rawData.status === '1',
        tem_banco: rawData.tem_banco === 'true' || rawData.tem_banco === 1 || rawData.tem_banco === '1',
        tem_marca_d_agua: rawData.tem_marca_d_agua === 'true' || rawData.tem_marca_d_agua === 1 || rawData.tem_marca_d_agua === '1',
      }

      // 4. Handle file upload if present
      const logotipo = request.file('logotipo')
      if (logotipo) {
        const fileName = `${cuid()}.${logotipo.extname}`
        await logotipo.move(app.makePath('tmp/uploads'), {
          name: fileName,
          overwrite: true
        })
        updateData.logotipo = fileName
      }

      // 5. Update the ModeloFactura
      const modelo = await this.service.atualizarModelo(params.id, {
        ...updateData,
        client: trx
      })

      // 6. Handle bancos relationship if provided 
      if (bancos) {
        // Parse bancos if it's a string
        let bancosArray = bancos;
        if (typeof bancos === 'string') {
          try {
            bancosArray = JSON.parse(bancos);
          } catch (error) {
            console.error('Erro ao fazer parse dos bancos:', error);
            throw new Error('Formato inválido para os dados dos bancos');
          }
        }

        // Process and update bank associations if we have valid data
        if (Array.isArray(bancosArray)) {
          // If bancosArray is empty, it will delete all related banks
          await this.service.sincronizarBancos(params.id, bancosArray, trx);
          // Reload the model with the bancos relationship
          await modelo.load('bancos');
        }
      } else {
        // If no bancos are provided, delete all related banks
        await this.service.sincronizarBancos(params.id, [], trx);
        await modelo.load('bancos');
      }

      // 7. Commit the transaction if everything is successful
      await trx.commit()

      return response.status(200).json({
        success: true,
        message: 'Modelo de fatura atualizado com sucesso',
        data: modelo
      })
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback()
      return response.status(500).json({
        error: 'Erro ao atualizar modelo de fatura',
        details: error.message
      })
    }
  }


  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }

  // Bank Management Methods
  public async listBancos({ params, response }: HttpContext) {
    try {
      const bancos = await this.service.listarBancosDoModelo(params.modeloFacturaId)
      return response.status(200).json({ data: bancos })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao listar bancos do modelo',
        details: error.message
      })
    }
  }

  public async addBanco({ params, request, response }: HttpContext) {
    try {
      const data = request.only(['banco_id', 'iban', 'n_conta', 'abreviacao'])
      const banco = await this.service.adicionarBanco(params.modeloFacturaId, data)
      return response.status(201).json({ data: banco })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao adicionar banco',
        details: error.message
      })
    }
  }

  public async updateBanco({ params, request, response }: HttpContext) {
    try {
      const data = request.only(['iban', 'n_conta', 'abreviacao'])
      const banco = await this.service.atualizarBanco(
        params.modeloFacturaId,
        params.bancoId,
        data
      )
      return response.status(200).json({ data: banco })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao atualizar banco',
        details: error.message
      })
    }
  }

  public async removeBanco({ params, response }: HttpContext) {
    try {
      await this.service.removerBanco(params.modeloFacturaId, params.bancoId)
      return response.status(204).json({
        success: true,
        message: 'Banco removido com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao remover banco',
        details: error.message
      })
    }
  }

  public async syncBancos({ params, request, response }: HttpContext) {
    const trx = await ModelosFactura.transaction()

    try {
      const bancos = request.input('bancos', [])
      if (!Array.isArray(bancos)) {
        throw new Error('O parâmetro "bancos" deve ser um array')
      }

      await this.service.sincronizarBancos(Number(params.modeloFacturaId), bancos, trx)
      await trx.commit()

      const bancosAtualizados = await this.service.listarBancosDoModelo(Number(params.modeloFacturaId))
      return response.status(200).json({ data: bancosAtualizados })
    } catch (error) {
      await trx.rollback()
      return response.status(500).json({
        error: 'Erro ao sincronizar bancos',
        details: error.message
      })
    }
  }
}