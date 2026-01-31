import type { HttpContext } from '@adonisjs/core/http'
import FolhaSalarioService from '../services/folha_salario_service.js'

export default class FolhaSalarioController {
  constructor(private service = new FolhaSalarioService()) { }

  public async index({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes')
      const ano = request.input('ano')
      const id_colaborador = request.input('id_colaborador')

      let folhas

      if (mes && ano) {
        folhas = await this.service.findByMesAno(Number(mes), Number(ano))
      } else if (id_colaborador) {
        folhas = await this.service.findByColaborador(Number(id_colaborador))
      } else {
        folhas = await this.service.findAll()
      }

      return response.json({
        status: 'success',
        data: folhas
      })
    } catch (error) {
      console.error('Erro ao listar folhas:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao listar folhas de salário'
      })
    }
  }

  public async show({ params, response }: HttpContext) {
    try {
      const { id } = params

      const folha = await this.service.findById(Number(id))

      if (!folha) {
        return response.status(404).json({
          status: 'error',
          message: 'Folha não encontrada'
        })
      }

      return response.json({
        status: 'success',
        data: folha
      })
    } catch (error) {
      console.error('Erro ao buscar folha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar folha de salário'
      })
    }
  }

  public async store({ request, response }: HttpContext) {
    try {
      const folhaData = request.all()

      const folha = await this.service.create(folhaData)

      return response.status(201).json({
        status: 'success',
        message: 'Folha criada com sucesso',
        data: folha
      })
    } catch (error) {
      console.error('Erro ao criar folha:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao criar folha de salário'
      })
    }
  }

  public async gerarFolha({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes')
      const ano = request.input('ano')

      if (!mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Mês e ano são obrigatórios'
        })
      }

      const folhas = await this.service.gerarFolha(Number(mes), Number(ano))

      return response.status(201).json({
        status: 'success',
        message: `Folha gerada com sucesso para ${folhas.length} colaboradores`,
        data: folhas
      })
    } catch (error) {
      console.error('Erro ao gerar folha:', error)

      let message = 'Erro ao gerar folha de salário'
      if (error.message === 'Nenhum colaborador ativo encontrado') {
        message = 'Nenhum colaborador ativo encontrado'
      } else if (error.message === 'Já existe folha gerada para este período') {
        message = 'Já existe folha gerada para este período'
      }

      return response.status(400).json({
        status: 'error',
        message: message
      })
    }
  }

  public async update({ params, request, response }: HttpContext) {
    try {
      const { id } = params
      const folhaData = request.all()

      const folha = await this.service.update(Number(id), folhaData)

      if (!folha) {
        return response.status(404).json({
          status: 'error',
          message: 'Folha não encontrada'
        })
      }

      return response.json({
        status: 'success',
        message: 'Folha atualizada com sucesso',
        data: folha
      })
    } catch (error) {
      console.error('Erro ao atualizar folha:', error)
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao atualizar folha de salário'
      })
    }
  }

  public async delete({ params, response }: HttpContext) {
    try {
      const { id } = params
      const deleted = await this.service.delete(Number(id))
      if (!deleted) {
        return response.status(404).json({
          status: 'error',
          message: 'Folha não encontrada'
        })
      }
      return response.json({
        status: 'success',
        message: 'Folha excluída com sucesso'
      })
    } catch (error) {
      console.error('Erro ao excluir folha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao excluir folha'
      })
    }
  }

  public async findByColaboradorMesAno({ params, response }: HttpContext) {
    try {
      const { id_colaborador, mes, ano } = params

      if (!id_colaborador || !mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'ID do colaborador, mês e ano são obrigatórios'
        })
      }

      const folhas = await this.service.findByColaboradorMesAno(
        Number(id_colaborador), 
        Number(mes), 
        Number(ano)
      )

      return response.json({
        status: 'success',
        data: folhas
      })
    } catch (error) {
      console.error('Erro ao buscar folha por colaborador/mês/ano:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar folha de salário'
      })
    }
  }

  /** Busca dados resumidos para o Mapa de Salário */
  public async resumido({ params, response }: HttpContext) {
    try {
      const { ano, mes } = params
      
      if (!ano || !mes) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano e mês são obrigatórios'
        })
      }

      console.log('🔍 [CONTROLLER] Buscando dados resumidos para Mapa:', { ano, mes });
      
      // Buscar folhas do período
      const folhas = await this.service.findByMesAno(Number(mes), Number(ano))
      
      if (!folhas || folhas.length === 0) {
        return response.status(404).json({
          status: 'error',
          message: 'Nenhuma folha encontrada para este período'
        })
      }

      // Extrair dados únicos para o Mapa de Salário
      const dadosMapa: {
        empresa: any;
        funcionarios: Array<{
          nome_completo: string;
          imposto: {
            ss_trabalhador: number;
            ss_empresa: number;
            irt: number;
            liquido_a_pagar: number;
          };
        }>;
        totais: {
          total_ss_trabalhador: number;
          total_ss_empresa: number;
          total_irt: number;
          total_faltas: number;
          total_descontos_faltas: number;
          total_adiantamento: number;
          total_outros_descontos: number;
          total_liquido_a_pagar: number;
        };
      } = {
        empresa: folhas[0]?.colaborador?.empresa || {},
        funcionarios: [],
        totais: {
          total_ss_trabalhador: 0,
          total_ss_empresa: 0,
          total_irt: 0,
          total_faltas: 0,
          total_descontos_faltas: 0,
          total_adiantamento: 0,
          total_outros_descontos: 0,
          total_liquido_a_pagar: 0
        }
      };

      // Processar cada folha para extrair colaboradores e totais
      folhas.forEach(folha => {
        // Adicionar funcionário da folha atual
        dadosMapa.funcionarios.push({
          nome_completo: folha.nome_funcionario,
          imposto: {
            ss_trabalhador: folha.mc_ss || 0,
            ss_empresa: folha.ss || 0,
            irt: folha.irt || 0,
            liquido_a_pagar: folha.liquido || 0
          }
        });

        // Calcular totais diretamente da folha
        dadosMapa.totais.total_ss_trabalhador += (folha.mc_ss || 0);
        dadosMapa.totais.total_ss_empresa += (folha.ss || 0);
        dadosMapa.totais.total_irt += (folha.irt || 0);
        dadosMapa.totais.total_outros_descontos += (folha.outros_descontos || 0);
        dadosMapa.totais.total_liquido_a_pagar += (folha.liquido || 0);
      });

      console.log('✅ [CONTROLLER] Dados do Mapa montados:', {
        funcionarios: dadosMapa.funcionarios.length,
        totais: dadosMapa.totais
      });

      return response.json({
        status: 'success',
        data: dadosMapa
      });
      
    } catch (error) {
      console.error('❌ [CONTROLLER] Erro ao buscar dados resumidos:', error);
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar dados para o Mapa de Salário'
      })
    }
  }

  public async calcularTotais({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes')
      const ano = request.input('ano')

      if (!mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Mês e ano são obrigatórios'
        })
      }

      const totais = await this.service.calcularTotais(Number(mes), Number(ano))

      return response.json({
        status: 'success',
        data: totais
      })
    } catch (error) {
      console.error('Erro ao calcular totais:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao calcular totais da folha'
      })
    }
  }

  public async processar({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes')
      const ano = request.input('ano')

      const folhas = await this.service.findByMesAno(Number(mes), Number(ano))

      for (const folha of folhas) {
        await this.service.update(folha.id, {
          status: 'processado'
        })
      }

      return response.json({
        status: 'success',
        message: 'Folha processada com sucesso'
      })
    } catch (error) {
      console.error('Erro ao processar folha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao processar folha'
      })
    }
  }

  public async anosComFolha({ response }: HttpContext) {
    try {
      const anos = await this.service.getAnosComFolha()

      return response.json({
        status: 'success',
        data: anos
      })
    } catch (error) {
      console.error('Erro ao buscar anos com folha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar anos com folha de salário'
      })
    }
  }

  public async mesesComFolha({ request, response }: HttpContext) {
    try {
      const ano = request.input('ano')

      if (!ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano é obrigatório'
        })
      }

      const meses = await this.service.getMesesComFolha(Number(ano))

      return response.json({
        status: 'success',
        data: meses
      })
    } catch (error) {
      console.error('Erro ao buscar meses com folha:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar meses com folha de salário'
      })
    }
  }

  public async calcular({ request, response }: HttpContext) {
    try {
      const dados = request.all();
      console.log('🔍 [DEBUG] Dados recebidos no endpoint calcular:', dados);
      
      // Extrair os dados necessários
      const {
        salario_base,
        total_bruto,
        // total_subsidios,
        // Outros campos necessários para o cálculo
        abono_familia = 0,
        taxa_ss_trabalhador = 0.03,
        outros_rendimento = 0,
        outros_subsidio_sujeitos = 0,
        subsidio_natal = 0,
        subsidio_representacao = 0,
        subsidio_disponibilidade = 0,
        sub_atavio = 0,
        premios = 0,
        horas_extras = 0,
        bonus = 0,
        subsidio_ferias = 0,
        subsidio_alimentacao = 0,
        subsidio_transporte = 0
      } = dados;
      
      // Calcular a matéria coletável do IRT
      const materiaColetavelIRT = await this.service.calcularMateriaColetavelIRTApi(
        {
          funcionario: {}, // Dados do funcionário, se necessário
          faltaJustificadaQtd: 0,
          faltasNaoJustificadasQtd: 0,
          totalFaltasValor: 0,
          descontos_faltas: 0
        },
        {
          salario_base,
          abono_familia,
          taxa_ss_trabalhador,
          outros_rendimento,
          outros_subsidio_sujeitos,
          subsidio_natal,
          subsidio_representacao,
          subsidio_disponibilidade,
          sub_atavio,
          premios,
          horas_extras,
          bonus,
          subsidio_ferias,
          subsidio_alimentacao,
          subsidio_transporte
        }
      );

      console.log('🔍 [DEBUG] Matéria coletável IRT calculada:', materiaColetavelIRT);

      // Calcular o IRT usando o método público
      const irt = await this.service.calcularImpostoIRT(materiaColetavelIRT);
      console.log('🔍 [DEBUG] IRT calculado:', irt);
      
      // Calcular a Segurança Social (8% do salário bruto)
      const ss = total_bruto * 0.08;
      // Calcular a contribuição patronal (11.5% do salário bruto)
      const mc_ss = total_bruto * 0.115;
      // Calcular o líquido
      const liquido = total_bruto - ss - irt;
      // Calcular MC_IRT (contribuição patronal do IRT) - geralmente 0 ou valor fixo
      const mc_irt = 0;

      const resultado = {
        irt,
        ss,
        mc_ss,
        liquido,
        mc_irt,
        materia_coletavel_irt: materiaColetavelIRT
      };

      console.log('🔍 [DEBUG] Resultado final do cálculo:', resultado);

      return response.json({
        status: 'success',
        data: resultado
      });
    } catch (error) {
      console.error('Erro ao calcular IRT e Segurança Social:', error);
      return response.status(500).json({
        status: 'error',
        message: error.message || 'Erro ao calcular IRT e Segurança Social'
      });
    }
  }

  // ===== MÉTODOS PARA SUBSÍDIO DE NATAL =====

  /**
   * Obter meses com folha disponível para um ano específico
   */
  public async getFolhasDisponiveis({ params, response }: HttpContext) {
    try {
      const { ano } = params

      if (!ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano é obrigatório'
        })
      }

      const meses = await this.service.getFolhasDisponiveis(Number(ano))

      return response.json({
        status: 'success',
        data: meses
      })
    } catch (error) {
      console.error('Erro ao buscar folhas disponíveis:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao buscar folhas disponíveis'
      })
    }
  }

  /**
   * Verificar se subsídio de natal já foi aplicado no ano
   */
  public async verificarSubsidioNatalAplicado({ params, response }: HttpContext) {
    try {
      const { ano, mes } = params

      if (!ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Ano é obrigatório'
        })
      }

      const aplicado = await this.service.verificarSubsidioNatalAplicado(Number(ano), mes ? Number(mes) : undefined)

      return response.json({
        status: 'success',
        data: aplicado
      })
    } catch (error) {
      console.error('Erro ao verificar subsídio aplicado:', error)
      return response.status(500).json({
        status: 'error',
        message: 'Erro ao verificar subsídio aplicado'
      })
    }
  }

  /**
   * Aplicar subsídio de natal
   */
  public async aplicarSubsidioNatal({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes')
      const ano = request.input('ano')

      if (!mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Mês e ano são obrigatórios'
        })
      }

      const resultado = await this.service.aplicarSubsidioNatal(Number(mes), Number(ano))

      return response.json({
        status: 'success',
        message: `Subsídio de natal aplicado com sucesso para ${resultado.quantidade} funcionários`,
        data: resultado
      })
    } catch (error) {
      console.error('Erro ao aplicar subsídio de natal:', error)
      
      let message = 'Erro ao aplicar subsídio de natal'
      if (error.message === 'Subsídio de natal já foi aplicado neste mês') {
        message = 'Subsídio de natal já foi aplicado neste mês'
      } else if (error.message.includes('Não existe folha de salário gerada')) {
        message = error.message
      }

      return response.status(400).json({
        status: 'error',
        message: message
      })
    }
  }

  /**
   * Remover subsídio de natal
   */
  public async removerSubsidioNatal({ request, response }: HttpContext) {
    try {
      const mes = request.input('mes')
      const ano = request.input('ano')

      if (!mes || !ano) {
        return response.status(400).json({
          status: 'error',
          message: 'Mês e ano são obrigatórios'
        })
      }

      const resultado = await this.service.removerSubsidioNatal(Number(mes), Number(ano))

      return response.json({
        status: 'success',
        message: `Subsídio de natal removido com sucesso para ${resultado.quantidade} funcionários`,
        data: resultado
      })
    } catch (error) {
      console.error('Erro ao remover subsídio de natal:', error)

      let message = 'Erro ao remover subsídio de natal'
      if (error.message?.includes('Não existe subsídio de natal aplicado')) {
        message = error.message
      }

      return response.status(400).json({
        status: 'error',
        message: message
      })
    }
  }
}
