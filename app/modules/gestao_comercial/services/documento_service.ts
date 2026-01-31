import TipoDocumento from '../models/TipoDocumento.js'
import NomeDocumento from '../models/NomeDocumento.js'
import Documento from '../models/Documento.js'
import DocumentoItem from '../models/DocumentoItem.js'
import type { ModelQueryBuilder } from '@adonisjs/lucid/orm'
import { DateTime } from 'luxon'

export default class DocumentoService {
  /**
   * Counts documents by their due date (data_vencimento) within a date range for a specific company
   * @param dataInicio Start date in ISO format (YYYY-MM-DD)
   * @param dataFim End date in ISO format (YYYY-MM-DD)
   * @param empresaId Company ID
   * @returns Object with success status and count of documents
   */
  public async countByDateRange(dataInicio: string, dataFim: string, empresaId: number) {
    try {
      const startDate = DateTime.fromISO(dataInicio).startOf('day').toSQL()
      const endDate = DateTime.fromISO(dataFim).endOf('day').toSQL()

      const count = await Documento.query()
        .where('empresa_id', empresaId)
        .count('* as total')
        .first()

      return {
        success: true,
        count: count ? Number(count.$extras.total) : 0
      }
    } catch (error) {
      console.error('Error in countByDateRange:', error)
      return {
        success: false,
        error: 'Erro ao contar documentos',
        details: error.message
      }
    }
  }



  async list() {
    return await Documento.all()
  }

  async listAll(page: number = 1, limit: number = 10, search: string = '', clienteId: string | null = null, tipoDocumentoId: string | null = null) {
    const query = Documento.query()
      .select('*')
      .withCount('itens', (query) => {
        query.as('items_count')
      })
      .preload('itens')
      .preload('moeda')
    if (search) {
      query.whereILike('nome', `%${search}%`)
    }

    if (tipoDocumentoId) {
      query.where('tipoDocumentoId', tipoDocumentoId)
    }

    if (clienteId) {
      query.where('clienteId', clienteId)
    }

    return await query.paginate(page, limit)
  }

  async findById(id: number) {
    return await Documento.findOrFail(id)
  }

  async create(data: Partial<Documento>) {
    return await Documento.create(data)
  }

  async update(id: number, data: Partial<Documento>) {
    const documento = await Documento.findOrFail(id)
    documento.merge(data)
    await documento.save()
    return documento
  }

  async delete(id: number) {
    const documento = await Documento.findOrFail(id)
    await documento.delete()
  }


  async listTipoDocumentos() {
    return await TipoDocumento.all()
  }

  async listNomeDocumentosByIdTipoDoc(idTipoDocumento: number) {
    return await NomeDocumento.query().where('id_tipo_documento', idTipoDocumento)
  }

  async getDocumentosByOriginalId(id_documento_original: number, id_nome_documento: number) {
    console.log(`Buscando recibos para documento original ${id_documento_original}...`);

    const recibos = await Documento.query()
      .where('id_documento_original', id_documento_original)
      .andWhere('id_nome_documento', id_nome_documento)
      .andWhereNot('estado', 'cancelado')
      .orderBy('created_at', 'desc')
      .preload('itens')
      .preload('moeda')
      .preload('tipoDocumento')
      .preload('nomeDocumento');

    console.log(`Encontrados ${recibos.length} recibos não cancelados`);

    return recibos;
  }


  async getDocumentosRelacionados(documentoId: number, nomeDocumentoId: number) {
    // Primeiro, pega o documento original para obter o gross_total
    const documentoOriginal = await Documento.findOrFail(documentoId);

    // Busca todos os recibos (documentos com id_nome_documento) 
    // que estão vinculados a este documento e não estão cancelados
    const recibos = await Documento.query()
      .where('id_documento_original', documentoId)
      .andWhere('id_nome_documento', nomeDocumentoId)
      .andWhereNot('estado', 'cancelado')
      .preload('itens')
      .preload('moeda')
      .preload('tipoDocumento')
      .preload('nomeDocumento')
      .orderBy('created_at', 'desc');

    // Filtra os recibos para garantir que não há cancelados
    const recibosAtivos = recibos.filter(recibo => recibo.estado !== 'cancelado');

    // Calcula o total já pago somando os valores liquidados dos recibos ativos
    const totalPago = recibosAtivos.reduce((total, recibo) => {
      return total + parseFloat(String(recibo.valorLiquidado || '0'));
    }, 0);

    // Verifica se o total pago é maior ou igual ao valor do documento original
    const limiteAtingido = totalPago >= parseFloat(String(documentoOriginal.grossTotal || '0'));

    return {
      recibos: recibosAtivos,
      totalPago,
      limiteAtingido,
      valorDocumento: parseFloat(String(documentoOriginal.grossTotal || '0'))
    };
  }


  async getDocumentReferences(id: number) {
    return await Documento.query().select('referencia')
      .where('id', id)
      .firstOrFail();
  }


  async listNomeDocumentos() {
    return await NomeDocumento.all()
  }

  async cancelarRecibo(documentoId: number) {
    const documento = await Documento.findOrFail(documentoId)
    documento.estado = 'cancelado'
    await documento.save()
    return documento
  }

  async listarDocumentos() {
    return await Documento.query()
      .preload('tipoDocumento')
      .preload('nomeDocumento')
      .preload('moeda')
      .preload('itens')
      .orderBy('created_at', 'desc')
  }

  async obterDocumento(id: number) {
    return await Documento.query()
      .where('id', id)
      .preload('tipoDocumento')
      .preload('nomeDocumento')
      .preload('moeda')
      .preload('itens')
      .firstOrFail()
  }

  async criarDocumento(data: any, trx?: any) {
    // Gera o código automaticamente se o id_nome_documento estiver presente
    if (data.id_nome_documento && !data.numero) {
      data.numero = await this.gerarCodigoDocumento(data.id_nome_documento)
    }

    // Calculate gross total from items if they exist
    if (data.itens && Array.isArray(data.itens) && data.itens.length > 0) {
      const grossTotal = data.itens.reduce((total: number, item: any) => {
        const precoUnitario = Number(item.precoUnitario || item.preco_unitario || 0);
        const quantidade = Number(item.quantidade || 0);
        const desconto = Number(item.desconto || 0);
        const iva = Number(item.iva || 0);

        const subtotal = precoUnitario * quantidade;
        // Apply discount (if any) and then add IVA
        const totalItem = (subtotal - desconto) * (1 + (iva / 100));
        return total + totalItem;
      }, 0);

      // Set the calculated gross total
      data.grossTotal = grossTotal;
      data.totalFinal = grossTotal; // Assuming totalFinal should be the same as grossTotal
    }

    if (trx) {
      return await Documento.create(data, { client: trx })
    }
    return await Documento.create(data)
  }


  async criarDocumentoItens(documentoId: number, itens: any[], trx?: any) {
    const itemsToCreate = itens.map(item => ({
      ...item,
      documento_id: documentoId
    }))

    if (trx) {
      return await DocumentoItem.createMany(itemsToCreate, { client: trx })
    }
    return await DocumentoItem.createMany(itemsToCreate)
  }

  async atualizarDocumento(id: number, data: any) {
    const documento = await Documento.findOrFail(id)
    documento.merge(data)
    await documento.save()
    return documento
  }

  async removerDocumento(id: number) {
    const documento = await Documento.findOrFail(id)
    await documento.delete()
  }

  // Document items methods
  async adicionarItemDocumento(documentoId: number, data: any) {
    return await DocumentoItem.create({
      documento_id: documentoId,
      ...data
    })
  }

  async atualizarItemDocumento(documentoId: number, itemId: number, data: any) {
    const item = await DocumentoItem.query()
      .where('id', itemId)
      .andWhere('documento_id', documentoId)
      .firstOrFail()

    item.merge(data)
    await item.save()
    return item
  }

  async removerItemDocumento(documentoId: number, itemId: number) {
    const item = await DocumentoItem.query()
      .where('id', itemId)
      .andWhere('documento_id', documentoId)
      .firstOrFail()

    await item.delete()
  }

  // Utility methods
  private applyFilters(query: ModelQueryBuilder, filters: any) {
    if (filters.id_tipo_documento) {
      query.where('id_tipo_documento', filters.id_tipo_documento)
    }
    if (filters.id_nome_documento) {
      query.where('id_nome_documento', filters.id_nome_documento)
    }
    if (filters.estado) {
      query.where('estado', filters.status)
    }
    return query
  }



  /**
   * Gera um código de documento no formato:
   * [ABREVIAÇÃO] TATU[ANO]/[INCREMENTO]
   * Exemplo: FT TATU2025/01
   */
  public async gerarCodigoDocumento(id_nome_documento: number): Promise<string> {
    const nomeDoc = await NomeDocumento.find(id_nome_documento)
    if (!nomeDoc) {
      throw new Error('Nome de documento inválido')
    }

    const abreviacao =
      nomeDoc.abreviacao ||
      nomeDoc.nome?.substring(0, 2).toUpperCase() ||
      'DC'

    const anoAtual = new Date().getFullYear()

    const ultimoDoc = await Documento.query()
      .where('id_nome_documento', id_nome_documento)
      .whereRaw('YEAR(created_at) = ?', [anoAtual])
      .orderBy('id', 'desc')
      .first()

    let incremento = 1
    if (ultimoDoc) {
      const docString = String(ultimoDoc.numero || '')
      const match = docString.match(/\/(\d+)$/)
      if (match) {
        incremento = parseInt(match[1]) + 1
      }
    }


    const numeroFormatado = incremento.toString().padStart(2, '0')
    return `${abreviacao} TATU${anoAtual}/${numeroFormatado}`
  }

  /**
   * Gera um recibo a partir de um documento existente
   * @param documento Documento original para gerar o recibo
   * @returns Novo documento de recibo criado
   */
  public async gerarRecibo(documento: Documento) {
    // Inicia uma transação para garantir a integridade dos dados
    const trx = await Documento.transaction()
    try {
      // Cria um novo documento baseado no original
      const novoDocumento = new Documento()

      // Define os dados do novo documento explicitamente
      // usando apenas campos que existem no modelo Documento
      const novoDocumentoData: Partial<Documento> = {
        empresaId: documento.empresaId,
        clienteId: documento.clienteId,
        tipoDocumentoId: 1, // 1 = Recibo
        nomeDocumentoId: 12, // ID do tipo de documento Recibo
        documentoOriginalId: documento.id,
        numero: await this.gerarCodigoDocumento(12),
        estado: 'pendente',
        dataCriacao: DateTime.now(),
        dataEmissao: DateTime.now(),
        dataVencimento: documento.dataVencimento,
        moedaId: documento.moedaId,
        desconto: documento.desconto,
        descontoGlobal: documento.descontoGlobal,
        total: documento.total,
        totalFinal: documento.totalFinal,
        grossTotal: documento.grossTotal,
        observacoes: `Recibo gerado a partir do documento ${documento.numero}`,
        estabelecimentoId: documento.estabelecimentoId,
        modeloId: documento.modeloId,
        userId: documento.userId,
        referencia: documento.referencia,
        termos_condicoes: documento.termos_condicoes,
        motivoEmissao: documento.motivoEmissao,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now()
      }

      // Preenche o novo documento com os dados
      novoDocumento.fill(novoDocumentoData)

      // Salva o novo documento
      await novoDocumento.useTransaction(trx).save()

      // Obtém todos os itens do documento original
      const itensOriginais = await DocumentoItem.query()
        .where('documento_id', documento.id)
        .useTransaction(trx)

      // Cria novos itens para o novo documento
      for (const item of itensOriginais) {
        const novoItem = new DocumentoItem()
        const itemData = item.$attributes

        novoItem.fill({
          ...itemData,
          id: undefined, // Novo ID
          documentoId: novoDocumento.id, // Vincula ao novo documento
          createdAt: DateTime.now(),
          updatedAt: DateTime.now()
        })

        await novoItem.useTransaction(trx).save()
      }

      // Commit da transação
      await trx.commit()

      // Recarrega o novo documento com os relacionamentos
      const documentoCompleto = await Documento.query()
        .where('id', novoDocumento.id)
        .preload('itens')
        .preload('moeda')
        .preload('tipoDocumento')
        .preload('nomeDocumento')
        .firstOrFail()

      return documentoCompleto
    } catch (error) {
      // Rollback em caso de erro
      await trx.rollback()
      console.error('Erro ao gerar recibo:', error)
      throw new Error('Falha ao gerar recibo')
    }
  }
}