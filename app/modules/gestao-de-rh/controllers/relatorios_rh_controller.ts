import type { HttpContext } from '@adonisjs/core/http'
import RelatorioRhService from '../services/relatorio_rh_service.js'

export default class RelatoriosRhController {
  constructor(private service = new RelatorioRhService()) { }

  public async gerar({ request, response }: HttpContext) {
    try {
      const { id_tipo_folha, idTipoFolha, ano, meses, id_empresa } = request.all()

      // Compatibilidade entre camelCase (frontend) e snake_case (backend)
      const tipoFolha = id_tipo_folha || idTipoFolha

      console.log('🔍 [DEBUG] Parâmetros recebidos:', { id_tipo_folha, idTipoFolha, tipoFolha, ano, meses, id_empresa })

      if (!tipoFolha || !ano || !meses || meses.length === 0) {
        console.log('❌ [DEBUG] Validação falhou:', { tipoFolha, ano, meses, mesesLength: meses?.length })
        return response.status(400).json({
          status: 'error',
          message: 'Dados incompletos para gerar relatório'
        })
      }

      // Temporário: usar id_empresa dos parâmetros diretamente
      const empresaId = id_empresa || 1 // Fallback para empresa 1
      const id_usuario = 3 // Temporário

      console.log('🔍 [DEBUG] Empresa final:', { id_empresa_param: id_empresa, empresaId_final: empresaId })

      if (!empresaId) {
        return response.status(400).json({
          status: 'error',
          message: 'Empresa não identificada'
        })
      }

      const relatoriosGerados = []

      for (const mes of meses) {
        try {
          const relatorio = await this.service.gerarRelatorio({
            id_tipo_folha: Number(tipoFolha),
            ano: Number(ano),
            mes: Number(mes),
            id_empresa: empresaId,
            id_usuario
          })
          relatoriosGerados.push(relatorio)
        } catch (error: any) {
          console.error(`Erro ao gerar relatório para ${mes}/${ano}:`, error.message)
          // Continuar com outros meses mesmo que um falhe
        }
      }

      return response.status(201).json({
        status: 'success',
        message: `${relatoriosGerados.length} relatório(s) gerado(s) com sucesso`,
        data: relatoriosGerados
      })
    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao gerar relatório'
      })
    }
  }


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


  public async show({ params, response }: HttpContext) {
    try {
      const { id } = params

      console.log('🔍 [DEBUG] ID recebido no show:', id)

      if (!id || isNaN(Number(id))) {
        return response.status(400).json({
          status: 'error',
          message: 'ID de relatório inválido'
        })
      }

      const relatorio = await this.service.findById(Number(id))

      if (!relatorio) {
        return response.status(404).json({
          status: 'error',
          message: 'Relatório não encontrado'
        })
      }

      return response.json({
        status: 'success',
        data: relatorio
      })
    } catch (error) {
      console.error('Erro ao buscar relatório:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar relatório'
      })
    }
  }

  public async baixar({ params, response }: HttpContext) {
    try {
      const { id } = params

      const relatorio = await this.service.findById(Number(id))

      if (!relatorio) {
        return response.status(404).json({
          status: 'error',
          message: 'Relatório não encontrado'
        })
      }

      // Aqui você implementaria a lógica real de download do arquivo
      // Por enquanto, retorna uma resposta simulada
      return response.json({
        status: 'success',
        message: 'Download do relatório simulado',
        data: {
          nome_arquivo: relatorio.nome_arquivo,
          caminho: relatorio.caminho_arquivo
        }
      })
    } catch (error) {
      console.error('Erro ao baixar relatório:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao baixar relatório'
      })
    }
  }

  public async excluir({ params, response }: HttpContext) {
    try {
      const { id } = params

      const deleted = await this.service.delete(Number(id))

      if (!deleted) {
        return response.status(404).json({
          status: 'error',
          message: 'Relatório não encontrado'
        })
      }

      return response.json({
        status: 'success',
        message: 'Relatório excluído com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir relatório:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao excluir relatório'
      })
    }
  }



  public async getDadosSegurancaSocial({ request, response }: HttpContext) {
    try {
      const { ano, mes, id_empresa } = request.all()


      if (!ano || !mes) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano e mês são obrigatórios'
        })
      }

      // Usar ID da empresa dos parâmetros ou fallback
      const empresaId = id_empresa || 1 // Temporário: fallback para empresa 1

      console.log(' [DEBUG] Empresa ID final:', empresaId)

      const dados = await this.service.getDadosSegurancaSocial(
        Number(ano),
        Number(mes),
        Number(empresaId)
      )

      return response.json({
        status: 'success',
        data: dados
      })
    } catch (error: any) {
      console.error(' [DEBUG] Erro em getDadosSegurancaSocial:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar dados para relatório de Segurança Social',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  public async getDadosIrtModelo2({ request, response }: HttpContext) {
    try {
      const { ano, id_empresa } = request.all()

      if (!ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano é obrigatório'
        })
      }

      // Usar ID da empresa dos parâmetros ou fallback
      const empresaId = id_empresa || 1 // Temporário: fallback para empresa 1

      console.log(' [DEBUG] Empresa ID final:', empresaId)

      const dados = await this.service.getDadosIrtModelo2(
        Number(ano),
        Number(empresaId)
      )

      return response.json({
        status: 'success',
        data: dados
      })
    } catch (error: any) {
      console.error(' [DEBUG] Erro em getDadosIrtModelo2:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar dados para relatório IRT Modelo 2',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  public async getDadosIrtMapaMensal({ request, response }: HttpContext) {
    try {
      const { ano, mes, id_empresa } = request.all()

      if (!ano || !mes) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano e mês são obrigatórios'
        })
      }

      // Usar ID da empresa dos parâmetros ou fallback
      const empresaId = id_empresa || 1 // Temporário: fallback para empresa 1

      console.log(' [DEBUG] Empresa ID final:', empresaId)

      const dados = await this.service.getDadosIrtMapaMensal(
        Number(ano),
        Number(mes),
        Number(empresaId)
      )

      return response.json({
        status: 'success',
        data: dados
      })
    } catch (error: any) {
      console.error(' [DEBUG] Erro em getDadosIrtMapaMensal:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar dados para relatório IRT Mapa Mensal',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  public async getDadosModeloPsx({ request, response }: HttpContext) {
    try {
      const { ano, mes, id_empresa } = request.all()

      if (!ano || !mes) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano e mês são obrigatórios'
        })
      }

      // Usar ID da empresa dos parâmetros ou fallback
      const empresaId = id_empresa || 1 // Temporário: fallback para empresa 1

      console.log(' [DEBUG] Empresa ID final:', empresaId)

      const dados = await this.service.getDadosModeloPsx(
        Number(ano),
        Number(mes),
        Number(empresaId)
      )

      return response.json({
        status: 'success',
        data: dados
      })
    } catch (error: any) {
      console.error(' [DEBUG] Erro em getDadosModeloPsx:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar dados para relatório Modelo PSX',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }

  public async getDadosIrtGrupoB({ request, response }: HttpContext) {
    try {
      const { ano, mes, id_empresa } = request.all()

      if (!ano || !mes) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano e mês são obrigatórios'
        })
      }

      // Usar ID da empresa dos parâmetros ou fallback
      const empresaId = id_empresa || 1 // Temporário: fallback para empresa 1

      console.log(' [DEBUG] Empresa ID final:', empresaId)

      const dados = await this.service.getDadosIrtGrupoB(
        Number(ano),
        Number(mes),
        Number(empresaId)
      )

      return response.json({
        status: 'success',
        data: dados
      })
    } catch (error: any) {
      console.error(' [DEBUG] Erro em getDadosIrtGrupoB:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao buscar dados para relatório IRT GRUPO B',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    }
  }
}
