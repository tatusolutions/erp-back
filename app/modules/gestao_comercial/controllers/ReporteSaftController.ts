import { HttpContext } from '@adonisjs/core/http'
import ReporteSaftService from '../services/ReporteSaftService.js'
import ReporteSaft from '../models/ReporteSaft.js'

export default class ReporteSaftController {
  constructor(private service = new ReporteSaftService()) { }

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
    return response.ok({ data })
  }
  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.ok({ data })
  }



  async store({ request, response }: HttpContext) {
    const data = request.only([
      'data_inicio',
      'data_fim',
      'total_documentos',
      'id_usuario',
      'id_empresa',
    ])

    // Add validation
    if (!data.data_inicio || !data.data_fim || !data.id_empresa) {
      return response.status(400).json({
        success: false,
        message: 'Campos obrigatórios não fornecidos'
      })
    }

    try {
      // Add any necessary pre-processing here
      const result = await this.service.create(data)
      return response.created(result)
    } catch (error) {
      console.error('Erro ao criar relatório:', error)
      return response.status(500).json({
        success: false,
        message: 'Erro ao criar relatório',
        error: error.message
      })
    }
  }



  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.ok(data)
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.all())
    return response.ok({
      data: {
        message: 'Marca atualizada com sucesso',
      },
    })
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }

  /**
   * Download SAF-T XML file for a specific report
   */
  async downloadSaft({ params, response }: HttpContext) {
    try {
      console.log(`🔍 Fetching report with ID: ${params.id}`)

      // Get the report data with empresa relationship
      const report = await ReporteSaft.query()
        .where('id', params.id)
        .preload('empresa')
        .first()

      if (!report) {
        console.error(`❌ Report not found with ID: ${params.id}`)
        return response.notFound({
          success: false,
          message: 'Relatório não encontrado'
        })
      }

      // Generate SAF-T XML content
      const saftXml = await this.service.generateSaftXml(report.id)

      if (!saftXml) {
        console.error('❌ Failed to generate SAF-T XML')
        return response.status(500).json({
          success: false,
          message: 'Erro ao gerar o ficheiro SAF-T',
          details: 'O serviço retornou um resultado vazio'
        })
      }

      // Formatar o nome do arquivo
      const dataInicio = report.dataInicio.toFormat('dd-MM-yyyy')
      const dataFim = report.dataFim.toFormat('dd-MM-yyyy')
      const nifEmpresa = report.empresa.nif || 'SEM-NIF'
      const nomeArquivo = `TATU ERP - SAF-T ${dataInicio} a ${dataFim} - ${nifEmpresa}.xml`

      // Criar o cabeçalho Content-Disposition
      const encodedFilename = encodeURIComponent(nomeArquivo).replace(/'/g, '%27')
      const contentDisposition = `attachment; filename="${encodedFilename}"; filename*=UTF-8''${encodedFilename}`

      // Configurar os cabeçalhos
      response.safeHeader('Content-Type', 'application/xml')
      response.safeHeader('Content-Disposition', contentDisposition)
      response.safeHeader('Content-Length', saftXml.length)
      response.safeHeader('X-Content-Type-Options', 'nosniff')

      // Enviar o XML
      return response.send(saftXml)

    } catch (error) {
      console.error('❌ Error in downloadSaft:', error)

      // Log additional error details if available
      if (error.code) console.error('Error code:', error.code)
      if (error.sql) console.error('SQL Error:', error.sql)

      return response.status(500).json({
        success: false,
        message: 'Erro ao processar o pedido',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      })
    }
  }
}
