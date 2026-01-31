import type { HttpContext } from '@adonisjs/core/http'
import ColaboradorDocumentoService from '../services/colaborador_documento_service.js'

export default class ColaboradorDocumentosController {
  constructor(private service = new ColaboradorDocumentoService()) {}

  public async index({ request, response }: HttpContext) {
    const colaboradorId = request.param('colaboradorId')
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const search = request.input('search', '')
    const isPaginate = request.input('isPaginate', '1')

    if (isPaginate === '0') {
      // Buscar todos sem paginação
      const data = await this.service.listAll(parseInt(colaboradorId), 1, 999, search)
      const documentos = data.all()
      
      // For each document, try to get the tipoDocumento info
      for (const doc of documentos) {
        if (doc.$attributes.id_tipo_documento) {
          try {
            const tipoDoc = await this.service.findTipoDocumentoById(doc.$attributes.id_tipo_documento)
            doc.tipoDocumento = tipoDoc
          } catch (error) {
            console.log('Could not load tipoDocumento for document:', doc.id)
            doc.tipoDocumento = null
          }
        }
      }
      
      return response.ok({ data: documentos })
    }

    const data = await this.service.listAll(parseInt(colaboradorId), page, limit, search)
    
    // Get the documents and add tipoDocumento info separately
    const documentos = data.all()
    
    // For each document, try to get the tipoDocumento info
    for (const doc of documentos) {
      if (doc.$attributes.id_tipo_documento) {
        try {
          const tipoDoc = await this.service.findTipoDocumentoById(doc.$attributes.id_tipo_documento)
          doc.tipoDocumento = tipoDoc
        } catch (error) {
          console.log('Could not load tipoDocumento for document:', doc.id)
          doc.tipoDocumento = null
        }
      }
    }
    
    return response.ok({ 
      data: documentos,
      meta: data.getMeta()
    })
  }

  public async store({ request, response, auth }: HttpContext) {
    const colaboradorId = request.param('colaboradorId')
    
    // Verificar se o arquivo foi enviado
    const file = request.file('ficheiro')
    if (!file) {
      return response.status(400).json({
        message: 'Arquivo é obrigatório'
      })
    }

    // Validar arquivo
    if (!file.isValid) {
      return response.status(400).json({
        message: 'Arquivo inválido',
        errors: file.errors
      })
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return response.status(400).json({
        message: 'Arquivo não pode ser maior que 10MB'
      })
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/pjpeg', // Progressive JPEG
      'image/png',
      'image/x-png', // Alternative PNG MIME type
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    // Check if MIME type is allowed or if it's a partial "application" type
    const isAllowedType = allowedTypes.includes(file.type!) || 
                         (file.type === 'application' && ['pdf', 'doc', 'docx'].includes(file.extname || ''))
    
    if (!isAllowedType) {
      return response.status(400).json({
        message: `Apenas PDF, imagens (JPG, PNG) e documentos Word são permitidos. Tipo recebido: ${file.type}, Extensão: ${file.extname}`
      })
    }

    // Extrair dados do FormData
    const data = {
      id_colaborador: parseInt(colaboradorId),
      id_tipo_documento: request.input('id_tipo_documento'),
      titulo: request.input('titulo'),
      descricao: request.input('descricao'),
      data_emissao: request.input('data_emissao'),
      data_validade: request.input('data_validade'),
      user_id: auth.user?.id || null
    }

    // Validar campos obrigatórios
    if (!data.id_tipo_documento || !data.titulo) {
      return response.status(400).json({
        message: 'Tipo de documento e título são obrigatórios'
      })
    }

    // TODO: Temporarily disabled due to table name mismatch between constraint (tipo_documentos) and model (tipo_anexos)
    // Verificar se o tipo de documento existe
    // try {
    //   const tipoDocumento = await this.service.findTipoDocumentoById(data.id_tipo_documento)
    //   if (!tipoDocumento) {
    //     return response.status(400).json({
    //       message: `Tipo de documento com ID ${data.id_tipo_documento} não encontrado`
    //     })
    //   }
    // } catch (error) {
    //   return response.status(400).json({
    //     message: 'Erro ao validar tipo de documento',
    //     error: error.message
    //   })
    // }

    // Criar documento
    const documento = await this.service.create(data, file)
    
    return response.created({
      message: 'Documento criado com sucesso',
      data: documento.serialize()
    })
  }

  public async show({ params, response }: HttpContext) {
    const documento = await this.service.findById(params.id)
    
    if (!documento) {
      return response.status(404).json({
        message: 'Documento não encontrado'
      })
    }

    // Try to get the tipoDocumento info separately
    if (documento.$attributes.id_tipo_documento) {
      try {
        const tipoDoc = await this.service.findTipoDocumentoById(documento.$attributes.id_tipo_documento)
        documento.tipoDocumento = tipoDoc
      } catch (error) {
        console.log('Could not load tipoDocumento for document:', documento.id)
        documento.tipoDocumento = null
      }
    }

    return response.ok(documento.serialize())
  }

  public async update({ params, request, response }: HttpContext) {
    const documento = await this.service.update(params.id, request.all())
    
    if (!documento) {
      return response.status(404).json({
        message: 'Documento não encontrado'
      })
    }

    return response.ok({
      message: 'Documento atualizado com sucesso',
      data: documento.serialize()
    })
  }

  public async destroy({ params, response }: HttpContext) {
    try {
      await this.service.delete(params.id)
      return response.status(200).json({
        message: 'Documento excluído com sucesso'
      })
    } catch (error) {
      return response.status(404).json({
        message: 'Documento não encontrado'
      })
    }
  }

  public async download({ params, response }: HttpContext) {
    try {
      const fileData = await this.service.download(params.id)
      
      const fs = await import('fs')
      const path = await import('path')
      
      response.header('Content-Type', fileData.mimeType)
      response.header('Content-Disposition', `attachment; filename="${fileData.filename}"`)
      
      return response.stream(fs.createReadStream(fileData.filePath))
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao baixar documento',
        error: error.message
      })
    }
  }

  public async getTipoDocumentos({ response }: HttpContext) {
    try {
      const tipos = await this.service.getTipoDocumentos()
      return response.ok({ data: tipos })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao buscar tipos de documentos',
        error: error.message
      })
    }
  }

  public async checkExpired({ response }: HttpContext) {
    try {
      const count = await this.service.checkExpiredDocuments()
      return response.ok({
        message: `${count} documentos marcados como expirados`,
        count
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Erro ao verificar documentos expirados',
        error: error.message
      })
    }
  }
}
