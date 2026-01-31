import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import ColaboradorDocumento from '../models/ColaboradorDocumento.js'
import TipoAnexoService from './tipo_anexo_service.js'
import Application from '@adonisjs/core/app'
import drive from '@adonisjs/drive/services/main'

export default class ColaboradorDocumentoService {
  constructor(private tipoAnexoService = new TipoAnexoService()) {}

  public async listAll(colaboradorId: number, page: number = 1, limit: number = 10, search: string = '') {
    return await ColaboradorDocumento.findByColaborador(colaboradorId, page, limit, search)
  }

  public async findById(id: number) {
    return await ColaboradorDocumento.findById(id)
  }

  public async create(data: any, file?: any) {
    try {
      let filePath = ''
      let originalName = ''
      let mimeType = null
      let fileSize = null

      // Processar upload do arquivo
      if (file) {
        const disk = drive.use()
        const timestamp = DateTime.now().toFormat('yyyyMMdd_HHmmss')
        const fileName = `${timestamp}_${file.clientName}`
        
        // Salvar arquivo no storage
        await disk.moveToDisk(file.tmpPath!, `colaborador_documentos/${fileName}`)
        
        filePath = `colaborador_documentos/${fileName}`
        originalName = file.clientName
        mimeType = file.type
        fileSize = file.size
      }

      // Criar registro no banco
      const documento = await ColaboradorDocumento.createDocumento({
        id_colaborador: data.id_colaborador,
        id_tipo_documento: data.id_tipo_documento,
        user_id: data.user_id || null,
        titulo: data.titulo,
        descricao: data.descricao || null,
        ficheiro: filePath,
        ficheiro_original: originalName,
        mime_type: mimeType,
        tamanho_ficheiro: fileSize,
        data_emissao: data.data_emissao ? DateTime.fromISO(data.data_emissao) : null,
        data_validade: data.data_validade ? DateTime.fromISO(data.data_validade) : null,
        estado: data.estado || 'activo'
      })

      return documento.serialize()
    } catch (error) {
      console.error('Erro ao criar documento:', error)
      throw error
    }
  }

  public async update(id: number, data: any) {
    try {
      return await ColaboradorDocumento.updateDocumento(id, data)
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      throw error
    }
  }

  public async delete(id: number) {
    try {
      // Primeiro buscar o documento para remover o arquivo
      const documento = await ColaboradorDocumento.find(id)
      if (documento && documento.ficheiro) {
        const disk = drive.use()
        try {
          await disk.delete(documento.ficheiro)
        } catch (fileError) {
          console.error('Erro ao remover arquivo:', fileError)
          // Continuar com a exclusão do registro mesmo que o arquivo não seja encontrado
        }
      }

      // Excluir registro do banco
      return await ColaboradorDocumento.deleteDocumento(id)
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      throw error
    }
  }

  public async download(id: number) {
    try {
      const documento = await ColaboradorDocumento.find(id)
      if (!documento || !documento.ficheiro) {
        throw new Error('Documento não encontrado ou arquivo não disponível')
      }

      const disk = drive.use()
      const fileStream = await disk.getStream(documento.ficheiro)
      
      return {
        stream: fileStream,
        filename: documento.ficheiro_original,
        mimeType: documento.mime_type || 'application/octet-stream'
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
      throw error
    }
  }

  public async getTipoDocumentos() {
    try {
      const tipos = await this.tipoAnexoService.list()
      return tipos
    } catch (error) {
      console.error('Erro ao buscar tipos de documentos:', error)
      throw error
    }
  }

  public async checkExpiredDocuments() {
    try {
      const hoje = DateTime.now()
      const documentosExpirados = await ColaboradorDocumento.query()
        .where('data_validade', '<', hoje.toSQLDate())
        .where('estado', 'activo')
        .exec()

      // Atualizar status para expirado
      for (const documento of documentosExpirados) {
        documento.estado = 'expirado'
        await documento.save()
      }

      return documentosExpirados.length
    } catch (error) {
      console.error('Erro ao verificar documentos expirados:', error)
      throw error
    }
  }
}
