import Relatorio from '../models/Relatorio.js'
import Empresa from '../../empresas/models/Empresa.js'
import FolhaSalario from '../models/FolhaSalario.js'
import Colaborador from '../models/Colaborador.js'
import PrestadorPagamento from '../models/PrestadorPagamento.js'

export default class RelatorioRhService {
  async create(relatorioData: Partial<Relatorio>): Promise<Relatorio> {
    return Relatorio.create(relatorioData)
  }
  async listAll(page: number = 1, limit: number = 10, search: string = '', estado: string = '') {
    const query = Relatorio.query()
      .preload('empresa')

    if (search) {
      query.whereILike('mes', `%${search}%`)
    }

    if (estado) {
      query.where('estado', estado)
    }

    return await query.paginate(page, limit)
  }

  async list() {
    return await Relatorio.query()
      .preload('empresa')
      .exec()
  }

  async findAll(): Promise<Relatorio[]> {
    return await Relatorio.query()
      .preload('empresa')
      .preload('usuario')
      .orderBy('createdAt', 'desc')
      .exec()
  }

  async findById(id: number): Promise<Relatorio | null> {
    return await Relatorio.query()
      .where('id', id)
      .preload('empresa')
      .preload('usuario')
      .first()
  }

  async findByTipoAnoMes(id_tipo_folha: number, ano: number, mes: number): Promise<Relatorio[]> {
    return await Relatorio.query()
      .where('id_tipo_folha', id_tipo_folha)
      .where('ano', ano)
      .where('mes', mes)
      .preload('empresa')
      .preload('usuario')
      .orderBy('createdAt', 'desc')
      .exec()
  }

  async delete(id: number): Promise<boolean> {
    const result = await Relatorio.query().where('id', id).delete()
    return result.length > 0
  }

  async gerarRelatorio(dados: {
    id_tipo_folha: number;
    ano: number;
    mes: number;
    id_empresa?: number;
    id_usuario?: number;
  }): Promise<Relatorio> {
    // Verificar se já existe relatório para este período/tipo
    const existente = await Relatorio.query()
      .where('id_tipo_folha', dados.id_tipo_folha)
      .where('ano', dados.ano)
      .where('mes', dados.mes)
      .first()

    if (existente) {
      throw new Error(`Já existe um relatório do tipo ${dados.id_tipo_folha} para ${dados.mes}/${dados.ano}`)
    }

    return await this.create({
      id_tipo_folha: dados.id_tipo_folha,
      ano: dados.ano,
      mes: dados.mes,
      id_empresa: dados.id_empresa || null,
      id_usuario: dados.id_usuario || null,
      nome_arquivo: `relatorio_${dados.id_tipo_folha}_${dados.ano}_${dados.mes}.pdf`,
      caminho_arquivo: `/uploads/relatorios/relatorio_${dados.id_tipo_folha}_${dados.ano}_${dados.mes}.pdf`,
      status: 'gerado'
    })
  }

  async getDadosSegurancaSocial(ano: number, mes: number, empresaId: number): Promise<{
    empresa: any;
    folhas: any[];
  }> {
    const trx = await FolhaSalario.transaction()

    try {
      // Buscar dados da empresa
      const empresa = await Empresa.query({ client: trx })
        .where('id', empresaId)
        .first()

      if (!empresa) {
        throw new Error('Empresa não encontrada')
      }

      // Buscar folhas de salário do período com relacionamentos
      const folhas = await FolhaSalario.query({ client: trx })
        .whereHas('colaborador', (query) => {
          query.where('id_empresa', empresaId)
        })
        .where('ano', ano)
        .where('mes', mes)
       // .where('status', 'Processado')
        .preload('colaborador')
        .exec()

      await trx.commit()

      return {
        empresa: empresa.serialize(),
        folhas: folhas.map(folha => folha.serialize())
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async getDadosIrtModelo2(ano: number, empresaId: number): Promise<{
    empresa: any;
    funcionarios: any[];
  }> {
    const trx = await FolhaSalario.transaction()

    try {
      // Buscar dados da empresa
      const empresa = await Empresa.query({ client: trx })
        .where('id', empresaId)
        .first()

      if (!empresa) {
        throw new Error('Empresa não encontrada')
      }

      // Buscar todos os colaboradores que têm folhas processadas no ano
      const folhasDoAno = await FolhaSalario.query({ client: trx })
        .where('ano', ano)
        //  .where('status', 'Processado')
        .preload('colaborador')
        .exec()

      // Extrair colaboradores únicos das folhas
      const colaboradoresUnicos = new Map()
      folhasDoAno.forEach(folha => {
        if (!colaboradoresUnicos.has(folha.colaborador.id)) {
          colaboradoresUnicos.set(folha.colaborador.id, folha.colaborador)
        }
      })

      const colaboradores = Array.from(colaboradoresUnicos.values())

      // Para cada colaborador, calcular os totais anuais
      const funcionarios = []

      for (const colaborador of colaboradores) {
        // Buscar todas as folhas do colaborador no ano
        const folhasAno = await FolhaSalario.query({ client: trx })
          .where('id_colaborador', colaborador.id)
          .where('ano', ano)
          //    .where('status', 'Processado')
          .exec()

        if (folhasAno.length > 0) {
          // Calcular totais anuais
          let valorGlobalRendimentos = 0
          let montanteTotalImposto = 0

          folhasAno.forEach(folha => {
            valorGlobalRendimentos += Number(folha.liquido || 0)
            montanteTotalImposto += Number(folha.irt || 0)
          })

          funcionarios.push({
            nif: colaborador.bi || '',
            nome: colaborador.nome || '',
            nss: colaborador.nss || '',
            provincia_codigo: 'S/N',
            municipio_nome: 'S/N',
            valor_global_rendimentos: valorGlobalRendimentos,
            montante_total_imposto: montanteTotalImposto,
            id_funcionario: colaborador.id
          })
        }
      }

      await trx.commit()

      return {
        empresa: empresa.serialize(),
        funcionarios: funcionarios
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async getDadosIrtMapaMensal(ano: number, mes: number, empresaId: number): Promise<{
    empresa: any;
    funcionarios: any[];
  }> {
    const trx = await FolhaSalario.transaction()

    try {
      // Buscar dados da empresa
      const empresa = await Empresa.query({ client: trx })
        .where('id', empresaId)
        .first()

      if (!empresa) {
        throw new Error('Empresa não encontrada')
      }

      // Buscar folhas de salário do período com relacionamentos
      const folhas = await FolhaSalario.query({ client: trx })
        .where('ano', ano)
        .where('mes', mes)
        // .where('status', 'Processado')
        .preload('colaborador')
        .exec()

      // Mapear dados para o formato esperado pelo frontend
      const funcionarios = folhas.map(folha => {
        const colaborador = folha.colaborador
        return {
          nif: colaborador.bi || '',
          nome: colaborador.nome || '',
          nss: colaborador.nss || '',
          provincia_codigo: 'S/N',
          municipio_nome: 'S/N',
          salario_base: Number(folha.salario_base || 0),
          descontos_faltas: Number(folha.total_faltas_valor || 0),
          subsidio_alimentacao: Number(folha.subsidio_alimentacao || 0),
          subsidio_transporte: Number(folha.subsidio_transporte || 0),
          abono_familia: Number(folha.abono_familia || 0),
          reembolso_despesas: 0,
          outros: Number(folha.outros_descontos || 0),
          calculo_manual_excesso: 'N',
          excesso_subsidos_nao_sujeitos: 0,
          abono_falhas: Number(folha.abono_para_falhas || 0),
          subsidio_renda_casa: 0,
          compensacao_rescisao: 0,
          subsidio_ferias: Number(folha.subsidio_de_ferias || 0),
          horas_extras: Number(folha.horas_extras || 0),
          subsidio_atavio: Number(folha.subsidio_de_atavio || 0),
          subsidio_representacao: Number(folha.subsidio_de_representacao || 0),
          premios: Number(folha.premios || 0),
          subsidio_natal: Number(folha.subsidio_de_natal || 0),
          outros_subsidos_sujeitos: Number(folha.total_subsidios || 0),
          salario_iliquido: Number(folha.total_bruto || 0),
          registro_manual_ss: 'N',
          base_tributavel_ss: Number(folha.total_bruto || 0),
          nao_sujeito_ss: 'N',
          contribuicao_ss: Number(folha.ss || 0),
          base_tributavel_irt: Number(folha.total_bruto || 0),
          isento_irt: 'N',
          irt_apurado: Number(folha.irt || 0),
          id_funcionario: colaborador.id
        }
      })

      await trx.commit()

      return {
        empresa: empresa.serialize(),
        funcionarios: funcionarios
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async getDadosModeloPsx(ano: number, mes: number, empresaId: number): Promise<{
    empresa: any;
    beneficiarios: any[];
    data_processamento: string;
  }> {
    const trx = await FolhaSalario.transaction()

    try {
      // Buscar dados da empresa
      const empresa = await Empresa.query({ client: trx })
        .where('id', empresaId)
        .first()

      if (!empresa) {
        throw new Error('Empresa não encontrada')
      }

      const beneficiarios: any[] = []

      // Buscar folhas de salário dos colaboradores do período
      const folhas = await FolhaSalario.query({ client: trx })
        .where('ano', ano)
        .where('mes', mes)
        // .where('status', 'Processado')
        .preload('colaborador')
        .exec()

      // Adicionar colaboradores como beneficiários
      folhas.forEach(folha => {
        const colaborador = folha.colaborador
        beneficiarios.push({
          numero_sequencial: 0, // Será definido depois
          nome: colaborador.nome || '',
          referencia_transferencia: `SALARIO${this.getMesAbreviado(mes)}${ano}`,
          referencia_empresa: `SALARIO ${this.getMesNome(mes)} ${ano}`,
          morada: 'S/N-Angola', // Temporário
          nib_iban_conta: this.formatarIBAN(colaborador.iban || ''),
          valor: Number(folha.liquido || 0),
          moeda: 'AOA',
          bic: '', // Temporário - precisa ser implementado
          tipo: 'colaborador'
        })
      })

      // Buscar pagamentos de prestadores do período
      const prestadorPagamentos = await PrestadorPagamento.query({ client: trx })
        .where('ano', ano)
        .where('mes', mes)
        .where('empresa_id', empresaId)
       // .where('status', 'Processado')
        .preload('prestador')
        .exec()

      // Adicionar prestadores como beneficiários
      prestadorPagamentos.forEach(pagamento => {
        const prestador = pagamento.prestador
        beneficiarios.push({
          numero_sequencial: 0, // Será definido depois
          nome: prestador.nome || '',
          referencia_transferencia: `SALARIO${this.getMesAbreviado(mes)}${ano}`,
          referencia_empresa: `SALARIO ${this.getMesNome(mes)} ${ano}`,
          morada: 'S/N-Angola', // Temporário
          nib_iban_conta: this.formatarIBAN(prestador.iban || ''),
          valor: Number(pagamento.valor || 0),
          moeda: 'AOA',
          bic: '', // Temporário - precisa ser implementado
          tipo: 'prestador'
        })
      })

      // Definir números sequenciais
      beneficiarios.forEach((beneficiario, index) => {
        beneficiario.numero_sequencial = index + 1
      })

      await trx.commit()

      return {
        empresa: {
          ...empresa.serialize(),
          iban: '', // Temporário - precisa vir do banco de dados
          moeda_nome: 'AOA', // Temporário
          banco_swift: '' // Temporário
        },
        beneficiarios: beneficiarios,
        data_processamento: new Date().toISOString().split('T')[0]
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async getDadosIrtGrupoB(ano: number, mes: number, empresaId: number): Promise<{
    empresa: any;
    prestadores: any[];
  }> {
    const trx = await PrestadorPagamento.transaction()

    try {
      // Buscar dados da empresa
      const empresa = await Empresa.query({ client: trx })
        .where('id', empresaId)
        .first()

      if (!empresa) {
        throw new Error('Empresa não encontrada')
      }

      // Buscar pagamentos de prestadores do período
      const prestadorPagamentos = await PrestadorPagamento.query({ client: trx })
        .where('ano', ano)
        .where('mes', mes)
        .where('empresa_id', empresaId)
        //.where('status', 'Processado')
        .preload('prestador')
        .exec()

      // Mapear dados para o formato esperado pelo frontend
      const prestadores = prestadorPagamentos.map(pagamento => {
        const prestador = pagamento.prestador
        return {
          numero_ordem: 0, // Será definido depois
          nif_angolano: 'S',
          identificacao_prestador: prestador.nif || '',
          nome_denominacao: prestador.nome || '',
          grupo_tributacao_irt: prestador.tipo_grupo || '',
          numero_seguranca_social: '', // Temporário - campo não existe no model Prestador
          provincia: 'S/N', // Temporário - precisa vir do relacionamento
          municipio: 'S/N', // Temporário - precisa vir do relacionamento
          numero_declaracao_conformidade: '', // Temporário - campo não existe no model
          descricao_servico: 'Serviços prestados', // Temporário
          numero_fatura: '', // Temporário - campo não existe no model
          data_factura: pagamento.data_pagamento ? pagamento.data_pagamento.toFormat('yyyy-MM-dd') : '',
          data_pagamento: pagamento.data_pagamento ? pagamento.data_pagamento.toFormat('yyyy-MM-dd') : '',
          valor_factura: Number(pagamento.valor || 0),
          valor_pago: Number(pagamento.valor || 0),
          valor_sujeito_retencao: Number(pagamento.valor || 0),
          taxa: 0, // Temporário - campo não existe no model
          imposto_a_pagar: 0 // Temporário - campo não existe no model
        }
      })

      // Definir números sequenciais
      prestadores.forEach((prestador, index) => {
        prestador.numero_ordem = index + 1
      })

      await trx.commit()

      return {
        empresa: empresa.serialize(),
        prestadores: prestadores
      }
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  private getMesNome(mes: number): string {
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ]
    return meses[mes - 1] || `Mês ${mes}`
  }

  private getMesAbreviado(mes: number): string {
    const meses = [
      'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN',
      'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'
    ]
    return meses[mes - 1] || `M${mes}`
  }

  private formatarIBAN(iban: string): string {
    if (!iban) return ''

    // Remover espaços e prefixos AO06/AO006, depois adicionar AO06
    let ibanLimpo = iban.replace(/\s/g, '')
    ibanLimpo = ibanLimpo.replace(/AO06/g, '')
    ibanLimpo = ibanLimpo.replace(/AO006/g, '')

    return `AO06${ibanLimpo}`
  }
}
