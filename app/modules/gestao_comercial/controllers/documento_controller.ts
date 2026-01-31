import type { HttpContext } from '@adonisjs/core/http'
import DocumentoService from '../services/documento_service.js'
import Documento from '../models/Documento.js'
import DocumentoItem from '../models/DocumentoItem.js'

export default class DocumentoController {
  constructor(private service = new DocumentoService()) { }

  // Document type methods
  public async listTipoDocumentos({ response }: HttpContext) {
    try {
      const data = await this.service.listTipoDocumentos()
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao listar tipos de documento',
        details: error.message
      })
    }
  }

  public async listNomeDocumentosByIdTipoDoc({ params, response }: HttpContext) {
    try {
      const idTipoDocumento = params.id
      const data = await this.service.listNomeDocumentosByIdTipoDoc(idTipoDocumento)
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao listar nomes de documento por tipo',
        details: error.message
      })
    }
  }

  public async getDocumentosByOriginalId({ params, response }: HttpContext) {
    try {
      const id_documento_original = params.id_documento_original;
      const id_nome_documento = params.id_nome_documento;
      console.log('Buscando recibos para o documento original:', id_documento_original);

      // O serviço agora retorna apenas recibos não cancelados
      const recibos = await this.service.getDocumentosByOriginalId(id_documento_original, id_nome_documento);

      console.log('Dados encontrados:', JSON.stringify(recibos, null, 2));

      // Retorna o array de recibos diretamente
      return response.json(recibos);
    } catch (error) {
      console.error('Erro ao buscar recibos:', error);
      return response.status(500).json({
        error: 'Erro ao listar recibos',
        details: error.message
      });
    }
  }


  public async getDocumentosRelacionados({ params, response }: HttpContext) {
    try {
      const documentoId = params.documentoId
      const nomeDocumentoId = params.nomeDocumentoId
      const data = await this.service.getDocumentosRelacionados(documentoId, nomeDocumentoId)
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao listar documentos relacionados',
        details: error.message
      })
    }
  }

  public async cancelarRecibo({ params, response }: HttpContext) {
    try {
      const data = await this.service.cancelarRecibo(Number(params.id))
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao cancelar recibo',
        details: error.message
      })
    }
  }

  public async getDocumentReferences({ params, response }: HttpContext) {
    try {
      const id = params.id;
      const data = await this.service.getDocumentReferences(id);
      return response.status(200).json(data);
    } catch (error) {
      return response.status(404).json({
        error: 'Documento não encontrado',
        message: error.message
      });
    }
  }

  public async listNomeDocumentos({ response }: HttpContext) {
    try {
      const data = await this.service.listNomeDocumentos()
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao listar todos os nomes de documento',
        details: error.message
      })
    }
  }

  // Document CRUD methods
  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const clienteId = request.input('clienteId', null)
    const tipoDocumentoId = request.input('tipoDocumentoId', null)
    const data = await this.service.listAll(page, limit, search, clienteId, tipoDocumentoId)
    return response.ok({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.ok({ data })
  }


  public async store({ request, response }: HttpContext) {
    const trx = await Documento.transaction()

    try {
      const { itens, ...documentoData } = request.all()

      // Create the document first
      const documento = await this.service.criarDocumento(documentoData, trx)

      // If there are items, create them
      if (itens && Array.isArray(itens) && itens.length > 0) {
        await this.service.criarDocumentoItens(documento.id, itens, trx)
      }

      // Commit the transaction
      await trx.commit()

      // Reload the document with relationships
      const documentoCompleto = await this.service.obterDocumento(documento.id)

      return response.status(201).json({ data: documentoCompleto })
    } catch (error) {
      // Rollback the transaction in case of error
      await trx.rollback()

      return response.status(500).json({
        error: 'Erro ao criar documento',
        details: error.message
      })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const data = await this.service.obterDocumento(params.id)
      return response.status(200).json({ data })
    } catch (error) {
      return response.status(404).json({
        error: 'Documento não encontrado',
        details: error.message
      })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const data = request.all()
      const documento = await this.service.atualizarDocumento(params.id, data)
      return response.status(200).json({ data: documento })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao atualizar documento',
        details: error.message
      })
    }
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      await this.service.removerDocumento(Number(params.id))  // Convert to number
      return response.status(204).json({
        success: true,
        message: 'Documento removido com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao remover documento',
        details: error.message
      })
    }
  }

  // Document items methods
  public async storeItem({ request, params, response }: HttpContext) {
    const documentoId = params.documentoId
    const data = request.only([
      'produto_id',
      'preco_unitario',
      'quantidade',
      'desconto',
      'iva',
      'total',
      'descricao',
      'unidade_medida'
    ])

    console.log('Received item data:', data); // Debug log

    try {
      // Find the document first
      const documento = await Documento.findOrFail(documentoId)

      // Create the document item with explicit field mapping
      const itemData = {
        documentoId: documento.id,
        empresaId: documento.empresaId || 1, // Add empresaId from document with fallback
        produtoId: data.produto_id, // Make sure this is set
        precoUnitario: data.preco_unitario || 0,
        quantidade: data.quantidade || 1,
        desconto: data.desconto || 0,
        iva: data.iva || 0,
        total: data.total || 0,
        descricao: data.descricao || '',
        unidadeMedida: data.unidade_medida || 'un'
      };

      console.log('Creating document item with data:', itemData); // Debug log

      // Create the document item
      const item = await documento.related('itens').create(itemData)

      return response.created({
        success: true,
        data: item
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao adicionar item ao documento',
        details: error.message
      })
    }
  }

  public async listItens({ params, response }: HttpContext) {
    try {
      const documento = await Documento.query()
        .where('id', params.documentoId)
        .preload('itens')
        .firstOrFail()

      return response.json({
        success: true,
        data: documento.itens
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        error: 'Documento não encontrado'
      })
    }
  }

  public async showItem({ params, response }: HttpContext) {
    try {
      const item = await DocumentoItem.query()
        .where('documento_id', params.documentoId)
        .where('id', params.itemId)
        .firstOrFail()

      return response.json({
        success: true,
        data: item
      })
    } catch (error) {
      return response.status(404).json({
        success: false,
        error: 'Item não encontrado'
      })
    }
  }

  public async updateItem({ params, request, response }: HttpContext) {
    const data = request.only([
      'produto_id',
      'preco_unitario',
      'quantidade',
      'desconto',
      'iva',
      'total',
      'descricao',
      'unidade_medida'
    ])

    try {
      const item = await DocumentoItem.query()
        .where('documento_id', params.documentoId)
        .where('id', params.itemId)
        .firstOrFail()

      item.merge(data)
      await item.save()

      return response.json({
        success: true,
        data: item
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao atualizar item do documento'
      })
    }
  }

  public async deleteItem({ params, response }: HttpContext) {
    try {
      const item = await DocumentoItem.query()
        .where('documento_id', params.documentoId)
        .where('id', params.itemId)
        .firstOrFail()

      await item.delete()

      return response.json({
        success: true,
        message: 'Item removido com sucesso'
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao remover item do documento'
      })
    }
  }
  public async countByDateRange({ request, response }: HttpContext) {
    try {
      const { data_inicio, data_fim, id_empresa } = request.qs()

      if (!data_inicio || !data_fim || !id_empresa) {
        return response.status(400).json({
          error: 'Parâmetros obrigatórios: data_inicio, data_fim e id_empresa'
        })
      }

      const result = await this.service.countByDateRange(
        data_inicio,
        data_fim,
        Number(id_empresa)
      )

      return response.status(200).json(result)
    } catch (error) {
      return response.status(500).json({
        error: 'Erro ao contar documentos por período',
        details: error.message
      })
    }
  }

  public async byPrefix({ params, response }: HttpContext) {
    const prefixo = decodeURIComponent(params.prefixo);
    const documentos = await Documento.query()
      .whereILike('referencia', `${prefixo}/%`)
      .select(['id', 'referencia']);

    return response.json(documentos);
  }

  // DocumentoController.ts
  public async getVinculados({ params, response }: HttpContext) {
    const documentos = await Documento.query()
      .where('id_documento_original', params.id);

    return response.json(documentos);
  }

  public async enviarDocumentoPorEmail({ request, params, response }: HttpContext) {
    try {
      const documento = await Documento.query()
        .where('id', params.documentoId)
        .firstOrFail()

      console.log("documento", documento);
      return;

      const recibo = await this.service.enviarDocumentoPorEmail(documento)


      return response.json({
        success: true,
        data: recibo
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao gerar recibo'
      })
    }
  }


  public async gerarRecibo({ request, params, response }: HttpContext) {


    try {
      const documento = await Documento.query()
        .where('id', params.documentoId)
        .firstOrFail()

      console.log("documento", documento);
      return;


      const recibo = await this.service.gerarRecibo(documento)




      return response.json({
        success: true,
        data: recibo
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        error: 'Erro ao gerar recibo'
      })
    }
  }


  public async getDocumentoById({ params, response }: HttpContext) {
    try {
      const documento = await Documento.query()
        .select('id', 'referencia', 'numero') // Include other fields you might need
        .where('id', params.id)
        .firstOrFail();

      return response.json({
        success: true,
        data: {
          id: documento.id,
          referencia: documento.referencia || `Documento #${documento.id}`,
          // Include other fields you need
        }
      });
    } catch (error) {
      return response.status(404).json({
        success: false,
        message: 'Documento não encontrado'
      });
    }
  }

}