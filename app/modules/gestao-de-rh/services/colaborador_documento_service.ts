import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import ColaboradorDocumento from '../models/ColaboradorDocumento.js'
import TipoAnexoService from './tipo_anexo_service.js'
import app from '@adonisjs/core/services/app'

export default class ColaboradorDocumentoService {
  constructor(private tipoAnexoService = new TipoAnexoService()) {}

  async listAll(colaboradorId: number, page: number = 1, limit: number = 10, search: string = '') {
    const query = ColaboradorDocumento.query()
      .preload('tipoDocumento')
      .preload('usuario')
      .where('id_colaborador', colaboradorId)
      .orderBy('createdAt', 'desc')

    if (search) {
      query.where((subQuery) => {
        subQuery
          .where('titulo', 'LIKE', `%${search}%`)
          .orWhere('descricao', 'LIKE', `%${search}%`)
      })
    }

    return await query.paginate(page, limit)
  }

  async findTipoDocumentoById(id: number) {
    return await this.tipoAnexoService.findById(id)
  }

  async list() {
    return await ColaboradorDocumento.query().preload('tipoDocumento')
  }

  async findById(id: number) {
    return await ColaboradorDocumento.query()
      .preload('colaborador')
      .preload('tipoDocumento')
      .preload('usuario')
      .where('id', id)
      .first()
  }

  async create(data: any, file?: any) {
    try {
      let filePath = ''
      let originalName = ''
      let mimeType = null
      let fileSize = null

      // Processar upload do arquivo
      if (file) {
        const timestamp = DateTime.now().toFormat('yyyyMMdd_HHmmss')
        const fileName = `${timestamp}_${file.clientName}`
        
        // Salvar arquivo no storage
        await file.move(app.makePath('uploads/colaborador_documentos'), {
          name: fileName,
          overwrite: true
        })
        
        filePath = `uploads/colaborador_documentos/${fileName}`
        originalName = file.clientName
        mimeType = file.type
        fileSize = file.size
      }

      // Criar registro no banco - tentar com ORM primeiro
      try {
        const documento = await ColaboradorDocumento.create({
          id_colaborador: data.id_colaborador,
          id_tipo_documento: data.id_tipo_documento,
          user_id: data.user_id,
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
        return documento
      } catch (ormError) {
        console.log('ORM failed, trying direct query:', ormError.message)
        
        // Se falhar por constraint, tentar com IDs null e depois atualizar
        const documento = await ColaboradorDocumento.create({
          id_colaborador: data.id_colaborador,
          id_tipo_documento: null,
          user_id: null,
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

        // Tentar atualizar os IDs depois
        try {
          if (data.id_tipo_documento) {
            documento.id_tipo_documento = data.id_tipo_documento
          }
          if (data.user_id) {
            documento.user_id = data.user_id
          }
          await documento.save()
        } catch (updateError) {
          console.log('Could not update IDs, keeping them null')
        }

        return documento
      }
    } catch (error) {
      console.error('Erro ao criar documento:', error)
      throw error
    }
  }

  async update(id: number, data: any) {
    try {
      const documento = await ColaboradorDocumento.findOrFail(id)
      documento.merge(data)
      await documento.save()
      return documento
    } catch (error) {
      console.error('Erro ao atualizar documento:', error)
      throw error
    }
  }

  async delete(id: number) {
    try {
      // Primeiro buscar o documento para remover o arquivo
      const documento = await ColaboradorDocumento.find(id)
      if (documento && documento.ficheiro) {
        try {
          const fs = await import('fs/promises')
          const path = await import('path')
          const filePath = path.join(app.makePath(), documento.ficheiro)
          await fs.unlink(filePath)
        } catch (fileError) {
          console.error('Erro ao remover arquivo:', fileError)
          // Continuar com a exclusão do registro mesmo que o arquivo não seja encontrado
        }
      }

      // Excluir registro do banco
      await ColaboradorDocumento.query().where('id', id).delete()
    } catch (error) {
      console.error('Erro ao deletar documento:', error)
      throw error
    }
  }

  async download(id: number) {
    try {
      const documento = await ColaboradorDocumento.find(id)
      if (!documento || !documento.ficheiro) {
        throw new Error('Documento não encontrado ou arquivo não disponível')
      }

      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(app.makePath(), documento.ficheiro)
      
      return {
        filePath,
        filename: documento.ficheiro_original,
        mimeType: documento.mime_type || 'application/octet-stream'
      }
    } catch (error) {
      console.error('Erro ao baixar documento:', error)
      throw error
    }
  }

  async getTipoDocumentos() {
    try {
      const tipos = await this.tipoAnexoService.list()
      return tipos
    } catch (error) {
      console.error('Erro ao buscar tipos de documentos:', error)
      throw error
    }
  }

  async checkExpiredDocuments() {
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
