import FolhaSalario from '../models/FolhaSalario.js'
import Colaborador from '../models/Colaborador.js'
import MapaIRT from '../models/MapaIRT.js'
import { DateTime } from 'luxon'

export default class FolhaSalarioService {


  async create(folhaData: Partial<FolhaSalario>): Promise<FolhaSalario> {
    // Safety check: Verificar se já existe registro para este colaborador no mesmo mês/ano
    if (folhaData.id_colaborador && folhaData.mes && folhaData.ano) {
      const existente = await FolhaSalario.query()
        .where('id_colaborador', folhaData.id_colaborador)
        .where('mes', folhaData.mes)
        .where('ano', folhaData.ano)
        .first();

      if (existente) {
        throw new Error(`Já existe uma folha para o colaborador ${folhaData.id_colaborador} em ${folhaData.mes}/${folhaData.ano}`);
      }
    }

    // Calcular totais se não fornecidos
    if (folhaData.salario_base !== undefined) {
      const totalBruto = this.calcularTotalBruto(folhaData);
      folhaData.total_bruto = totalBruto;
      
      // Calcular IRT e Segurança Social
      const { irt, ss } = await this.calcularIRTESS(folhaData);
      folhaData.irt = irt || 0;
      folhaData.ss = ss || 0;
      
      // Calcular líquido
      folhaData.liquido = (totalBruto || 0) - (ss || 0) - (irt || 0);
      
      // Calcular segurança social patronal
      folhaData.mc_ss = (totalBruto || 0) * 0.11;
      
      // Calcular matéria coletável IRT
      folhaData.mc_irt = totalBruto || 0;
      
      // Calcular total de subsídios
      const totalSubsidios = this.calcularTotalSubsidios(folhaData);
      folhaData.total_subsidios = totalSubsidios;
      folhaData.subsidios = totalSubsidios;
    }

    return FolhaSalario.create(folhaData)
  }

  async findAll(): Promise<FolhaSalario[]> {
    return await FolhaSalario.query()
      .preload('colaborador', (query) => {
        query.preload('empresa')
      })
      .orderBy('ano', 'desc')
      .orderBy('mes', 'desc')
      .exec()
  }

  async findById(id: number): Promise<FolhaSalario | null> {
    return await FolhaSalario.query()
      .where('id', id)
      .preload('colaborador', (query) => {
        query.preload('empresa')
      })
      .first()
  }

  async findByMesAno(mes: number, ano: number): Promise<FolhaSalario[]> {
    return await FolhaSalario.query()
      .where('mes', mes)
      .where('ano', ano)
      .preload('colaborador', (query) => {
        query.preload('empresa')
      })
      .orderBy('nome_funcionario', 'asc')
      .exec()
  }

  async findByColaborador(id_colaborador: number): Promise<FolhaSalario[]> {
    return await FolhaSalario.query()
      .where('id_colaborador', id_colaborador)
      .preload('colaborador', (query) => {
        query.preload('empresa')
      })
      .orderBy('ano', 'desc')
      .orderBy('mes', 'desc')
      .exec()
  }

  async findByColaboradorMesAno(id_colaborador: number, mes: number, ano: number): Promise<FolhaSalario[]> {
    return await FolhaSalario.query()
      .where('id_colaborador', id_colaborador)
      .where('mes', mes)
      .where('ano', ano)
      .preload('colaborador', (query) => {
        query.preload('empresa')
      })
      .exec()
  }

  async update(id: number, folhaData: Partial<FolhaSalario>): Promise<FolhaSalario | null> {
    // Verificar se há dados para atualizar
    if (Object.keys(folhaData).length === 0) {
      throw new Error('Nenhum dado fornecido para atualização');
    }

    // Se houver atualização de valores que afetam o cálculo, recalcular IRT e SS
    if (this.precisaRecalculo(folhaData)) {
      // Buscar folha atual para obter dados existentes
      const folhaAtual = await FolhaSalario.query().where('id', id).first();
      if (!folhaAtual) {
        throw new Error('Folha não encontrada');
      }

      // Mesclar dados existentes com novos dados
      const dadosCompletos = { ...folhaAtual.toJSON(), ...folhaData };
      
      // Recalcular totais
      const totalBruto = this.calcularTotalBruto(dadosCompletos);
      folhaData.total_bruto = totalBruto;
      
      // Calcular IRT e Segurança Social
      const { irt, ss } = await this.calcularIRTESS(dadosCompletos);
      folhaData.irt = irt || 0;
      folhaData.ss = ss || 0;
      
      // Calcular líquido
      folhaData.liquido = (totalBruto || 0) - (ss || 0) - (irt || 0);
      
      // Calcular segurança social patronal
      folhaData.mc_ss = (totalBruto || 0) * 0.11;
      
      // Calcular matéria coletável IRT
      folhaData.mc_irt = totalBruto || 0;
      
      // Calcular total de subsídios
      const totalSubsidios = this.calcularTotalSubsidios(dadosCompletos);
      folhaData.total_subsidios = totalSubsidios;
      folhaData.subsidios = totalSubsidios;
    }

    await FolhaSalario.query().where('id', id).update(folhaData)
    return await this.findById(id)
  }

  async delete(id: number): Promise<boolean> {
    const result = await FolhaSalario.query().where('id', id).delete()
    return result.length > 0
  }

  async gerarFolha(mes: number, ano: number): Promise<FolhaSalario[]> {
    // Buscar colaboradores ativos
    const colaboradoresAtivos = await Colaborador.query()
      .where('estado', 'ativo')
      .exec()

    if (colaboradoresAtivos.length === 0) {
      throw new Error('Nenhum colaborador ativo encontrado')
    }

    // Verificar se já existe folha para este mês/ano
    const folhaExistente = await this.findByMesAno(mes, ano)
    if (folhaExistente.length > 0) {
      throw new Error('Já existe folha gerada para este período')
    }

    // Gerar folha para cada colaborador
    const folhasGeradas: FolhaSalario[] = []

    for (const colaborador of colaboradoresAtivos) {
      const salarioBase = colaborador.salario_base || 0

      // Remuneração adicional
      const horasExtras = 0
      const bonus = 0
      const premios = 0
      const outrosSubsidios = 0

      // Subsídios
      const subsidioAlimentacao = 0
      const subsidioTransporte = 0
      const subsidioNoturno = 0
      const subsidioTurno = 0
      const subsidioRisco = 0
      const subsidioRepresentacao = 0
      const subsidioRegencia = 0
      const subsidioRenda = 0
      const subsidioDisponibilidade = 0
      const subsidioExame = 0
      const subsidioAtavio = 0
      const subsidioFerias = 0
      const subsidioNatal = '0'
      const abonoFamilia = 0
      const abonoParaFalhas = 0

      // Calcular totais
      const totalSubsidios = horasExtras + bonus + premios + outrosSubsidios +
        subsidioAlimentacao + subsidioTransporte + subsidioNoturno +
        subsidioTurno + subsidioRisco + subsidioRepresentacao +
        subsidioRegencia + subsidioRenda + subsidioDisponibilidade +
        subsidioExame + subsidioAtavio + subsidioFerias +
        parseFloat(subsidioNatal) + abonoFamilia + abonoParaFalhas

      const totalBruto = salarioBase + totalSubsidios

      // Preparar dados para cálculo do IRT
      const dadosCalculoIRT = {
        salario_base: salarioBase,
        abono_familia: abonoFamilia,
        ss: 0, // 3% é um valor padrão, ajuste conforme necessário
        outros_rendimento: 0,
        outros_subsidios: outrosSubsidios,
        subsidio_natal: parseFloat(subsidioNatal),
        subsidio_representacao: 0,
        subsidio_disponibilidade: 0,
        sub_atavio: 0,
        premios: premios,
        horas_extras: horasExtras,
        bonus: bonus,
        subsidio_ferias: 0,
        subsidio_alimentacao: subsidioAlimentacao,
        subsidio_transporte: subsidioTransporte
      };

      // Calcular matéria coletável e IRT
      const materiaColetavelIRT = await this.calcularMateriaColetavelIRT({
        funcionario: colaborador,
        faltaJustificadaQtd: 0, // Ajustar conforme necessário
        faltasNaoJustificadasQtd: 0, // Ajustar conforme necessário
        totalFaltasValor: 0, // Ajustar conforme necessário 
      }, dadosCalculoIRT);

      const irt = await this.calcularIRT(materiaColetavelIRT);
      const ss = totalBruto * 0.03; // 8% Segurança Social
      const mc_ss = totalBruto * 0.11; // 11.5% Segurança Social Patronal
      const liquido = totalBruto - ss - irt; // Total Bruto - Descontos

      const folha = await this.create({
        id_colaborador: colaborador.id,
        nome_funcionario: colaborador.nome,
        ano: ano,
        mes: mes,

        // Remuneração
        salario_base: salarioBase,
        total_subsidios: totalSubsidios,
        total_bruto: totalBruto,
        horas_extras: horasExtras,
        bonus: bonus,
        premios: premios,
        outros_subsidios: outrosSubsidios,
        adicionar_remuneracao: false,

        // Subsídios
        subsidio_alimentacao: subsidioAlimentacao,
        subsidio_transporte: subsidioTransporte,
        subsidio_noturno: subsidioNoturno,
        subsidio_de_turno: subsidioTurno,
        subsidio_de_risco: subsidioRisco,
        subsidio_de_representacao: subsidioRepresentacao,
        subsidio_de_regencia: subsidioRegencia,
        subsidio_de_renda: subsidioRenda,
        subsidio_de_disponibilidade: subsidioDisponibilidade,
        subsidio_de_exame: subsidioExame,
        subsidio_de_atavio: subsidioAtavio,
        subsidio_de_ferias: subsidioFerias,
        subsidio_de_natal: subsidioNatal,
        abono_familia: abonoFamilia,
        abono_para_falhas: abonoParaFalhas,

        // Campos antigos (mantidos para compatibilidade)
        subsidios: totalSubsidios,
        ss: ss,
        irt: irt,
        outros_descontos: 0,
        liquido: liquido,
        mc_ss: mc_ss,
        mc_irt: 0,
        data_referencia: DateTime.fromObject({ year: ano, month: mes, day: 1 }),
        status: 'nao_processado'
      })

      folhasGeradas.push(folha)
    }

    return folhasGeradas
  }

  private async calcularMateriaColetavelIRT(
    folha: {
      funcionario: any,
      faltaJustificadaQtd: number,
      faltasNaoJustificadasQtd: number,
      totalFaltasValor: number, 
    },
    data: {
      salario_base: number,
      abono_familia: number,
      ss: number,
      outros_rendimento: number,
      outros_subsidios: number,
      subsidio_natal: number,
      subsidio_representacao: number,
      subsidio_disponibilidade: number,
      sub_atavio: number,
      premios: number,
      horas_extras: number,
      bonus: number,
      subsidio_ferias: number,
      subsidio_alimentacao: number,
      subsidio_transporte: number
    }
  ): Promise<number> {
    console.log('🔍 [DEBUG] calcularMateriaColetavelIRT - dados recebidos:', {
      salario_base: data.salario_base,
      abono_familia: data.abono_familia,
      ss: data.ss,
      outros_rendimento: data.outros_rendimento,
      outros_subsidios: data.outros_subsidios,
      subsidio_natal: data.subsidio_natal,
      subsidio_representacao: data.subsidio_representacao,
      subsidio_disponibilidade: data.subsidio_disponibilidade,
      sub_atavio: data.sub_atavio,
      premios: data.premios,
      horas_extras: data.horas_extras,
      bonus: data.bonus,
      subsidio_ferias: data.subsidio_ferias,
      subsidio_alimentacao: data.subsidio_alimentacao,
      subsidio_transporte: data.subsidio_transporte
    });
    // Calcular matéria coletável da segurança social
    const materiaColetavelSS = this.calcularMateriaColetavelSS({
       total_faltas: folha.totalFaltasValor
    }, {
      salario_base: data.salario_base,
      subsidio_alimentacao: data.subsidio_alimentacao,
      subsidio_transporte: data.subsidio_transporte,
      outros_subsidios: data.outros_subsidios,
      bonus: data.bonus
    });

    // Calcular matéria coletável do IRT
    const salarioBase = parseFloat(String(data.salario_base || 0));
    const abonoFamilia = this.calcularAbonoFamilia(data);
    const totalSSTrabalhador = parseFloat((materiaColetavelSS * (data.ss || 0.03)).toFixed(2));

    // Usar apenas o valor global dos descontos de faltas
    const totalDescontosFaltas = folha.totalFaltasValor || 0;

    // Calcular matéria coletável do IRT
    const calculoBase = parseFloat((
      salarioBase +
      abonoFamilia -
      totalSSTrabalhador +
      parseFloat(String(data.outros_rendimento || 0)) +
      parseFloat(String(data.outros_subsidios || 0)) +
      parseFloat(String(data.subsidio_natal || 0)) +
      parseFloat(String(data.subsidio_representacao || 0)) +
      parseFloat(String(data.subsidio_disponibilidade || 0)) +
      parseFloat(String(data.sub_atavio || 0)) +
      parseFloat(String(data.premios || 0)) +
      parseFloat(String(data.horas_extras || 0)) +
      parseFloat(String(data.bonus || 0)) +
      parseFloat(String(data.subsidio_ferias || 0)) -
      totalDescontosFaltas
    ).toFixed(2));

    console.log('🔍 [DEBUG] Cálculo base matéria coletável:', {
      salarioBase,
      abonoFamilia,
      totalSSTrabalhador,
      outros_rendimento: data.outros_rendimento,
      outros_subsidios: data.outros_subsidios,
      subsidio_natal: data.subsidio_natal,
      subsidio_representacao: data.subsidio_representacao,
      subsidio_disponibilidade: data.subsidio_disponibilidade,
      sub_atavio: data.sub_atavio,
      premios: data.premios,
      horas_extras: data.horas_extras,
      bonus: data.bonus,
      subsidio_ferias: data.subsidio_ferias,
      totalDescontosFaltas,
      calculoBase
    });

    // Ajustar com base nos subsídios de alimentação e transporte
    const subsidioAlimentacao = parseFloat(String(data.subsidio_alimentacao || 0));
    const subsidioTransporte = parseFloat(String(data.subsidio_transporte || 0));

    let materiaColetavelIRT = 0;

    if (subsidioAlimentacao <= 30000 && subsidioTransporte <= 30000) {
      materiaColetavelIRT = calculoBase;
    } else if (subsidioAlimentacao <= 30000) {
      materiaColetavelIRT = parseFloat((calculoBase + subsidioTransporte - 30000).toFixed(2));
    } else if (subsidioTransporte <= 30000) {
      materiaColetavelIRT = parseFloat((calculoBase + subsidioAlimentacao - 30000).toFixed(2));
    } else {
      materiaColetavelIRT = parseFloat((
        calculoBase +
        (subsidioTransporte - 30000) +
        (subsidioAlimentacao - 30000)
      ).toFixed(2));
    }

    return Math.max(0, parseFloat(materiaColetavelIRT.toFixed(2)));
  }

  public async calcularMateriaColetavelIRTApi(
    folha: {
      funcionario: any,
      faltaJustificadaQtd: number,
      faltasNaoJustificadasQtd: number,
      totalFaltasValor: number, 
    },
    data: {
      salario_base: number,
      abono_familia: number,
      ss: number,
      outros_rendimento: number,
      outros_subsidios: number,
      subsidio_natal: number,
      subsidio_representacao: number,
      subsidio_disponibilidade: number,
      sub_atavio: number,
      premios: number,
      horas_extras: number,
      bonus: number,
      subsidio_ferias: number,
      subsidio_alimentacao: number,
      subsidio_transporte: number
    }
  ): Promise<number> {
    return this.calcularMateriaColetavelIRT(folha, data)
  }


  private calcularMateriaColetavelSS(
    folha: {
       total_faltas: number
    },
    data: {
      salario_base: number,
      subsidio_alimentacao: number,
      subsidio_transporte: number,
      outros_subsidios: number,
      bonus: number
    }
  ): number {
    return parseFloat((
      parseFloat(String(data.salario_base || 0)) +
      parseFloat(String(data.subsidio_alimentacao || 0)) +
      parseFloat(String(data.outros_subsidios || 0)) +
      parseFloat(String(data.subsidio_transporte || 0)) +
      parseFloat(String(data.bonus || 0)) -
      (folha.total_faltas || 0)
    ).toFixed(2));
  }

  private calcularAbonoFamilia(data: { abono_familia: number, salario_base: number }): number {
    const abonoFamilia = parseFloat(String(data.abono_familia || 0));
    const salarioBase = parseFloat(String(data.salario_base || 0));
    return parseFloat((abonoFamilia > 0 ? Math.min(abonoFamilia, salarioBase * 0.1) : 0).toFixed(2));
  }

  private calcularRegularizacaoAlimentacaoTransporte(
    data: { subsidio_alimentacao: number, subsidio_transporte: number },
    folha: { faltaJustificadaQtd: number, faltasNaoJustificadasQtd: number, totalFaltasValor: number },
    diasUteis: number
  ) {
    const subsidioAlimentacao = parseFloat(String(data.subsidio_alimentacao || 0));
    const subsidioTransporte = parseFloat(String(data.subsidio_transporte || 0));

    const regularizacaoNaoJustificada = (subsidioAlimentacao + subsidioTransporte) / diasUteis * (folha.faltasNaoJustificadasQtd || 0);
    const regularizacaoJustificada = (subsidioAlimentacao + subsidioTransporte) / diasUteis * (folha.faltaJustificadaQtd || 0);

    return {
      regularizacaoNaoJustificada,
      regularizacaoJustificada
    };
  }

  /**
   * Calcula o IRT para um determinado valor de matéria coletável
   * @param materiaColetavelIRT Valor da matéria coletável para cálculo do IRT
   * @returns Valor do IRT a ser pago
   */
  public async calcularImpostoIRT(materiaColetavelIRT: number): Promise<number> {
    return this.calcularIRT(materiaColetavelIRT);
  }

  
  private async calcularIRT(materiaColetavelIRT: number): Promise<number> { 
    
    if (materiaColetavelIRT <= 0) {
      console.log('🔍 [DEBUG] Matéria coletável <= 0, retornando 0');
      return 0;
    }

    const escaloes = await MapaIRT.query()
      .where('status', 'activo')
      .orderBy('valor_de', 'asc')
      .exec();
 
    let imposto = 0;
    let escalaoEncontrado = false;

    // Encontrar o escalão correspondente ao valor da matéria coletável
    for (let i = 0; i < escaloes.length; i++) {
      const escalao = escaloes[i]; 
      
      let condicao = false;
       
      // Lógica específica para cada tipo de escalão
      if (escalao.nome === 'Até') {
        // Primeiro escalão: valores de 0 até valorAte
        const valorAteNum = Number(escalao.valorAte);
        condicao = materiaColetavelIRT >= 0 && materiaColetavelIRT <= valorAteNum;
      } else if (escalao.nome === 'De' || escalao.nome === 'Acima') {
        // Demais escalões: valores de valorDe até valorAte (ou infinito se valorAte for muito grande)
        const valorDeNum = Number(escalao.valorDe);
        const valorAteNum = Number(escalao.valorAte);
        condicao = materiaColetavelIRT >= valorDeNum && 
                   (valorAteNum === 9999999999 || materiaColetavelIRT <= valorAteNum);
      }  
      
      if (condicao) { 
        escalaoEncontrado = true; 
        // Se for o primeiro escalão (Até) e estiver marcado como isento
        if (escalao.nome === 'Até' && escalao.isento === 'isento') {
            imposto = 0;  
        } else {
          // Cálculo baseado na porcentagem (sobre excesso) - seguindo modelo PHP
          const totalNum = Number(escalao.total);
          const percentagemNum = Number(escalao.percentagem);
          const valorFixoNum = Number(escalao.valor || 0);
          const excesso = materiaColetavelIRT - totalNum;
          imposto = (excesso * percentagemNum) + valorFixoNum;
          
          console.log('🔍 [DEBUG] Cálculo IRT detalhado:', {
            materiaColetavel: materiaColetavelIRT,
            escalaoNome: escalao.nome,
            valorDe: escalao.valorDe,
            valorAte: escalao.valorAte,
            total: totalNum,
            percentagem: percentagemNum,
            valorFixo: valorFixoNum,
            excesso,
            impostoCalculado: imposto
          });
        }
        break;
      }
    }

    if (!escalaoEncontrado) {
      console.log('🔍 [DEBUG] ❌ Nenhum escalão encontrado para o valor:', materiaColetavelIRT);
    }
 
    return Math.max(0, imposto);// Garantir que não retorne valor negativo
  }

  async getAnosComFolha(): Promise<number[]> {
    const anos = await FolhaSalario.query()
      .select('ano')
      .distinct()
      .orderBy('ano', 'asc') // Mais antigo para o mais novo
      .exec()

    return anos.map(folha => folha.ano)
  }

  async getMesesComFolha(ano: number): Promise<number[]> {
    const meses = await FolhaSalario.query()
      .select('mes')
      .distinct()
      .where('ano', ano)
      .orderBy('mes', 'asc') // Janeiro para dezembro
      .exec()

    return meses.map(folha => folha.mes)
  }

  async calcularTotais(mes: number, ano: number): Promise<any> {
    const folhas = await this.findByMesAno(mes, ano);

    const totais = folhas.reduce((acc, folha) => {
      // Função auxiliar para somar com precisão
      const somar = (valor1: number | null, valor2: number | null | undefined): number => {
        const num1 = valor1 || 0;
        const num2 = (valor2 === null || valor2 === undefined) ? 0 : valor2;
        return parseFloat((num1 + num2).toFixed(2));
      };

      // Remuneração
      acc.salario_base = somar(acc.salario_base, folha.salario_base);
      acc.total_subsidios = somar(acc.total_subsidios, folha.total_subsidios);
      acc.total_bruto = somar(acc.total_bruto, folha.total_bruto);
      acc.horas_extras = somar(acc.horas_extras, folha.horas_extras);
      acc.bonus = somar(acc.bonus, folha.bonus);
      acc.premios = somar(acc.premios, folha.premios);
      acc.outros_subsidios = somar(acc.outros_subsidios, folha.outros_subsidios);

      // Subsídios
      acc.subsidio_alimentacao = somar(acc.subsidio_alimentacao, folha.subsidio_alimentacao);
      acc.subsidio_transporte = somar(acc.subsidio_transporte, folha.subsidio_transporte);
      acc.subsidio_noturno = somar(acc.subsidio_noturno, folha.subsidio_noturno);
      acc.subsidio_de_turno = somar(acc.subsidio_de_turno, folha.subsidio_de_turno);
      acc.subsidio_de_risco = somar(acc.subsidio_de_risco, folha.subsidio_de_risco);
      acc.subsidio_de_representacao = somar(acc.subsidio_de_representacao, folha.subsidio_de_representacao);
      acc.subsidio_de_regencia = somar(acc.subsidio_de_regencia, folha.subsidio_de_regencia);
      acc.subsidio_de_renda = somar(acc.subsidio_de_renda, folha.subsidio_de_renda);
      acc.subsidio_de_disponibilidade = somar(acc.subsidio_de_disponibilidade, folha.subsidio_de_disponibilidade);
      acc.subsidio_de_exame = somar(acc.subsidio_de_exame, folha.subsidio_de_exame);
      acc.subsidio_de_atavio = somar(acc.subsidio_de_atavio, folha.subsidio_de_atavio);
      acc.subsidio_de_ferias = somar(acc.subsidio_de_ferias, folha.subsidio_de_ferias);
      acc.abono_familia = somar(acc.abono_familia, folha.abono_familia);
      acc.abono_para_falhas = somar(acc.abono_para_falhas, folha.abono_para_falhas);

      // Descontos
      acc.ss = somar(acc.ss, folha.ss);
      acc.irt = somar(acc.irt, folha.irt);
      acc.outros_descontos = somar(acc.outros_descontos, folha.outros_descontos);
      acc.liquido = somar(acc.liquido, folha.liquido);

      return acc;
    }, {
      // Inicialização dos totais
      salario_base: 0,
      total_subsidios: 0,
      total_bruto: 0,
      horas_extras: 0,
      bonus: 0,
      premios: 0,
      outros_subsidios: 0,
      subsidio_alimentacao: 0,
      subsidio_transporte: 0,
      subsidio_noturno: 0,
      subsidio_de_turno: 0,
      subsidio_de_risco: 0,
      subsidio_de_representacao: 0,
      subsidio_de_regencia: 0,
      subsidio_de_renda: 0,
      subsidio_de_disponibilidade: 0,
      subsidio_de_exame: 0,
      subsidio_de_atavio: 0,
      subsidio_de_ferias: 0,
      abono_familia: 0,
      abono_para_falhas: 0,
      ss: 0,
      irt: 0,
      outros_descontos: 0,
      liquido: 0,
      mc_ss: 0,
      mc_irt: 0,
      total_colaboradores: folhas.length
    });

    return totais;
  }

  // ===== MÉTODOS PARA SUBSÍDIO DE NATAL =====

  /**
   * Obter meses com folha gerada para um ano específico
   */
  async getFolhasDisponiveis(ano: number): Promise<number[]> {
    const trx = await FolhaSalario.transaction()
    
    try {
      const folhas = await FolhaSalario.query({ client: trx })
        .where('ano', ano)
        .where('status', '!=', 'cancelado')
        .distinct('mes')
        .select('mes')

      await trx.commit()
      return folhas.map((folha) => folha.mes)
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Verificar se subsídio de natal já foi aplicado no ano
   */
  async verificarSubsidioNatalAplicado(ano: number, mes?: number): Promise<boolean> {
    const trx = await FolhaSalario.transaction()
    
    try {
      const query = FolhaSalario.query({ client: trx })
        .where('ano', ano)
        .where('status', '!=', 'cancelado')

      if (mes !== undefined) {
        query.where('mes', mes)
      }

      const existe = await query
        .whereNotNull('subsidio_de_natal')
        .whereNotIn('subsidio_de_natal', ['0', '0.0', '0.00', ''])
        .first()

      await trx.commit()
      return !!existe
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Recalcula IRT e totais de uma folha individual
   */
  private async recalcularIRTETotais(folha: FolhaSalario): Promise<void> {
    // Recarregar a folha do banco para obter valores atualizados
    const folhaAtualizada = await FolhaSalario.query()
      .where('id', folha.id)
      .first();

    if (!folhaAtualizada) {
      console.error('❌ [DEBUG] Folha não encontrada ao recarregar');
      return;
    }

    // Preparar dados para cálculo do IRT
    const dadosCalculoIRT = {
      salario_base: folhaAtualizada.salario_base || 0,
      abono_familia: folhaAtualizada.abono_familia || 0,
      ss: 0.03,
      outros_rendimento: (folhaAtualizada.horas_extras || 0),
      outros_subsidios: (folhaAtualizada.outros_subsidios || 0) +  (folhaAtualizada.subsidio_de_representacao || 0) + (folhaAtualizada.subsidio_de_disponibilidade || 0) + (folhaAtualizada.subsidio_de_atavio || 0) + (folhaAtualizada.subsidio_de_renda || 0) + (folhaAtualizada.subsidio_de_risco || 0) + (folhaAtualizada.subsidio_noturno || 0) + (folhaAtualizada.subsidio_de_exame || 0) + (folhaAtualizada.subsidio_de_turno || 0) + (folhaAtualizada.subsidio_de_regencia || 0),
      subsidio_natal: parseFloat(String(folhaAtualizada.subsidio_de_natal || 0)),
      subsidio_representacao: folhaAtualizada.subsidio_de_representacao || 0,
      subsidio_disponibilidade: folhaAtualizada.subsidio_de_disponibilidade || 0,
      sub_atavio: folhaAtualizada.subsidio_de_atavio || 0,
      premios: folhaAtualizada.premios || 0,
      horas_extras: folhaAtualizada.horas_extras || 0,
      bonus: folhaAtualizada.bonus || 0,
      subsidio_ferias: folhaAtualizada.subsidio_de_ferias || 0,
      subsidio_alimentacao: folhaAtualizada.subsidio_alimentacao || 0,
      subsidio_transporte: folhaAtualizada.subsidio_transporte || 0 
    };

    // Calcular matéria coletável e IRT
    const materiaColetavelIRT = await this.calcularMateriaColetavelIRT({
      funcionario: { instalacao: { dias_uteis: 22 } }, // Mock para cálculo
      faltaJustificadaQtd: folhaAtualizada.falta_justificada_qtd || 0,
      faltasNaoJustificadasQtd: folhaAtualizada.faltas_nao_justificadas_qtd || 0,
      totalFaltasValor: folhaAtualizada.total_faltas_valor || 0
    }, dadosCalculoIRT);

    // Calcular valores das faltas
    const diasUteis = 22; // Padrão, poderia vir da empresa
    const salarioBase = parseFloat(String(folhaAtualizada.salario_base || 0));
    const subsidioAlimentacao = parseFloat(String(folhaAtualizada.subsidio_alimentacao || 0));
    const subsidioTransporte = parseFloat(String(folhaAtualizada.subsidio_transporte || 0));
    
    const faltasJustificadasQtd = parseFloat(String(folhaAtualizada.falta_justificada_qtd || 0));
    const faltasNaoJustificadasQtd = parseFloat(String(folhaAtualizada.faltas_nao_justificadas_qtd || 0));
    
    // Fórmulas para desconto por falta
    const descontoPorFaltasNjus = (salarioBase + subsidioAlimentacao + subsidioTransporte) / diasUteis;
    const descontoPorFaltasJus = (subsidioAlimentacao + subsidioTransporte) / diasUteis;
    
    // Calcular valores individuais
    const faltaJustificadaValor = descontoPorFaltasJus * faltasJustificadasQtd;
    const faltasNaoJustificadasValor = descontoPorFaltasNjus * faltasNaoJustificadasQtd;
    const totalFaltasValor = faltaJustificadaValor + faltasNaoJustificadasValor;
    const totalFaltasQtd = faltasJustificadasQtd + faltasNaoJustificadasQtd;

     const irt = await this.calcularIRT(materiaColetavelIRT);
    const totalBruto = folhaAtualizada.total_bruto ?? 0;
    
    // Calcular Segurança Social baseado na matéria coletável da SS (já inclui desconto de faltas)
    const materiaColetavelSS = this.calcularMateriaColetavelSS({
      total_faltas: folhaAtualizada.total_faltas_valor || 0
    }, {
      salario_base: folhaAtualizada.salario_base ?? 0,
      subsidio_alimentacao: folhaAtualizada.subsidio_alimentacao ?? 0,
      subsidio_transporte: folhaAtualizada.subsidio_transporte ?? 0,
      outros_subsidios: parseFloat(String(folhaAtualizada.outros_subsidios || 0)),
      bonus: folhaAtualizada.bonus ?? 0
    });
    
    const ss = materiaColetavelSS * 0.03;
    const liquido = totalBruto - ss - irt - (folhaAtualizada.total_faltas_valor || 0); // Adicionado desconto de faltas no líquido

    // Atualizar a folha com os novos valores
    await FolhaSalario.query()
      .where('id', folhaAtualizada.id)
      .update({
        irt: irt,
        ss: ss,
        liquido: liquido,
        mc_irt: materiaColetavelIRT,
        // Atualizar campos de faltas
        falta_justificada_valor: faltaJustificadaValor,
        faltas_nao_justificadas_valor: faltasNaoJustificadasValor,
        total_faltas_valor: totalFaltasValor,
        total_faltas: totalFaltasQtd
      });

    console.log('🔍 [DEBUG] IRT recalculado para folha', folhaAtualizada.id, ':', irt);

      // Verificar se os valores foram realmente salvos no banco
      const folhaVerificada = await FolhaSalario.query()
        .where('id', folhaAtualizada.id)
        .first();

      if (folhaVerificada) {
        console.log('✅ [DEBUG] Valores salvos na folha:', {
          irt: folhaVerificada.irt,
          ss: folhaVerificada.ss,
          liquido: folhaVerificada.liquido,
          falta_justificada_valor: folhaVerificada.falta_justificada_valor,
          faltas_nao_justificadas_valor: folhaVerificada.faltas_nao_justificadas_valor,
          total_faltas_valor: folhaVerificada.total_faltas_valor,
          total_faltas: folhaVerificada.total_faltas
        });
      }
  }

  /**
   * Aplica subsídio de natal para todos os funcionários da folha
   */
  async aplicarSubsidioNatal(mes: number, ano: number): Promise<any> {
    // Verificar se já foi aplicado
    const jaAplicado = await this.verificarSubsidioNatalAplicado(ano, mes)
    if (jaAplicado) {
      throw new Error('Subsídio de natal já foi aplicado neste mês')
    }

    // Buscar todas as folhas do mês/ano
    const folhas = await FolhaSalario.query()
      .where('mes', mes)
      .where('ano', ano)
      .where('status', '!=', 'cancelado')
      .preload('colaborador')
      .exec()

    if (folhas.length === 0) {
      throw new Error(`Não existe folha de salário gerada para ${mes}/${ano}`)
    }

    let valorTotal = 0
    let quantidadeAtualizada = 0

    // Aplicar subsídio para cada funcionário
    for (const folha of folhas) {
      const subsidioAtual = Number(folha.subsidio_de_natal ?? 0)
      if (subsidioAtual > 0) {
        continue
      }

      // Calcular subsídio de natal (salário base * 1/12 * meses trabalhados no ano)
      // Simplificado: 1/12 do salário base
      if (!folha.salario_base) {
        continue // Pular funcionários sem salário base definido
      }
      const subsidioCalculado = Math.round(folha.salario_base / 12)
      
      // Atualizar a folha com o subsídio
      await FolhaSalario.query()
        .where('id', folha.id)
        .update({
          subsidio_de_natal: subsidioCalculado.toString(),
          // Recalcular totais
          total_subsidios: (folha.total_subsidios || 0) + subsidioCalculado,
          total_bruto: (folha.total_bruto || 0) + subsidioCalculado,
          liquido: (folha.liquido || 0) + subsidioCalculado
        })

      // Recalcular IRT com os novos valores
      await this.recalcularIRTETotais(folha)

      valorTotal += subsidioCalculado
      quantidadeAtualizada++
    }

    return {
      quantidade: quantidadeAtualizada,
      valor_total: valorTotal,
      mes,
      ano
    }
  }

  /**
   * Remover subsídio de natal para todos os funcionários da folha
   */
  async removerSubsidioNatal(mes: number, ano: number): Promise<any> {
    const folhas = await FolhaSalario.query()
      .where('mes', mes)
      .where('ano', ano)
      .where('status', '!=', 'cancelado')
      .exec()

    if (folhas.length === 0) {
      throw new Error(`Não existe folha de salário gerada para ${mes}/${ano}`)
    }

    let valorTotal = 0
    let quantidadeAtualizada = 0

    for (const folha of folhas) {
      const subsidioAtual = Number(folha.subsidio_de_natal ?? 0)
      if (!subsidioAtual || subsidioAtual <= 0) {
        continue
      }

      // Remover o subsídio
      await FolhaSalario.query()
        .where('id', folha.id)
        .update({
          subsidio_de_natal: '0',
          total_subsidios: Math.max(0, (folha.total_subsidios || 0) - subsidioAtual),
          total_bruto: Math.max(0, (folha.total_bruto || 0) - subsidioAtual),
          liquido: Math.max(0, (folha.liquido || 0) - subsidioAtual)
        })

      // Recalcular IRT com os novos valores
      await this.recalcularIRTETotais(folha)

      valorTotal += subsidioAtual
      quantidadeAtualizada++
    }

    if (quantidadeAtualizada === 0) {
      throw new Error(`Não existe subsídio de natal aplicado para ${mes}/${ano}`)
    }

    return {
      quantidade: quantidadeAtualizada,
      valor_total: valorTotal,
      mes,
      ano
    }
  }

  /**
   * Calcula o total de subsídios da folha
   */
  private calcularTotalSubsidios(folhaData: any): number {
    const horasExtras = parseFloat(String(folhaData.horas_extras || 0));
    const bonus = parseFloat(String(folhaData.bonus || 0));
    const premios = parseFloat(String(folhaData.premios || 0));
    const outrosSubsidios = parseFloat(String(folhaData.outros_subsidios || 0));
    const subsidioAlimentacao = parseFloat(String(folhaData.subsidio_alimentacao || 0));
    const subsidioTransporte = parseFloat(String(folhaData.subsidio_transporte || 0));
    const subsidioNoturno = parseFloat(String(folhaData.subsidio_noturno || 0));
    const subsidioTurno = parseFloat(String(folhaData.subsidio_de_turno || 0));
    const subsidioRisco = parseFloat(String(folhaData.subsidio_de_risco || 0));
    const subsidioRepresentacao = parseFloat(String(folhaData.subsidio_de_representacao || 0));
    const subsidioRegencia = parseFloat(String(folhaData.subsidio_de_regencia || 0));
    const subsidioRenda = parseFloat(String(folhaData.subsidio_de_renda || 0));
    const subsidioDisponibilidade = parseFloat(String(folhaData.subsidio_de_disponibilidade || 0));
    const subsidioExame = parseFloat(String(folhaData.subsidio_de_exame || 0));
    const subsidioAtavio = parseFloat(String(folhaData.subsidio_de_atavio || 0));
    const subsidioFerias = parseFloat(String(folhaData.subsidio_de_ferias || 0));
    const subsidioNatal = parseFloat(String(folhaData.subsidio_de_natal || 0));
    const abonoFamilia = parseFloat(String(folhaData.abono_familia || 0));
    const abonoParaFalhas = parseFloat(String(folhaData.abono_para_falhas || 0));

    const result = horasExtras + bonus + premios + outrosSubsidios +
      subsidioAlimentacao + subsidioTransporte + subsidioNoturno +
      subsidioTurno + subsidioRisco + subsidioRepresentacao +
      subsidioRegencia + subsidioRenda + subsidioDisponibilidade +
      subsidioExame + subsidioAtavio + subsidioFerias +
      subsidioNatal + abonoFamilia + abonoParaFalhas;
    
    return isNaN(result) ? 0 : result;
  }

  /**
   * Calcula o total bruto da folha
   */
  private calcularTotalBruto(folhaData: any): number {
    const salarioBase = parseFloat(String(folhaData.salario_base || 0));
    const horasExtras = parseFloat(String(folhaData.horas_extras || 0));
    const bonus = parseFloat(String(folhaData.bonus || 0));
    const premios = parseFloat(String(folhaData.premios || 0));
    const outrosSubsidios = parseFloat(String(folhaData.outros_subsidios || 0));
    const subsidioAlimentacao = parseFloat(String(folhaData.subsidio_alimentacao || 0));
    const subsidioTransporte = parseFloat(String(folhaData.subsidio_transporte || 0));
    const subsidioNoturno = parseFloat(String(folhaData.subsidio_noturno || 0));
    const subsidioTurno = parseFloat(String(folhaData.subsidio_de_turno || 0));
    const subsidioRisco = parseFloat(String(folhaData.subsidio_de_risco || 0));
    const subsidioRepresentacao = parseFloat(String(folhaData.subsidio_de_representacao || 0));
    const subsidioRegencia = parseFloat(String(folhaData.subsidio_de_regencia || 0));
    const subsidioRenda = parseFloat(String(folhaData.subsidio_de_renda || 0));
    const subsidioDisponibilidade = parseFloat(String(folhaData.subsidio_de_disponibilidade || 0));
    const subsidioExame = parseFloat(String(folhaData.subsidio_de_exame || 0));
    const subsidioAtavio = parseFloat(String(folhaData.subsidio_de_atavio || 0));
    const subsidioFerias = parseFloat(String(folhaData.subsidio_de_ferias || 0));
    const subsidioNatal = parseFloat(String(folhaData.subsidio_de_natal || 0));
    const abonoFamilia = parseFloat(String(folhaData.abono_familia || 0));
    const abonoParaFalhas = parseFloat(String(folhaData.abono_para_falhas || 0));

    const totalSubsidios = horasExtras + bonus + premios + outrosSubsidios +
      subsidioAlimentacao + subsidioTransporte + subsidioNoturno +
      subsidioTurno + subsidioRisco + subsidioRepresentacao +
      subsidioRegencia + subsidioRenda + subsidioDisponibilidade +
      subsidioExame + subsidioAtavio + subsidioFerias +
      subsidioNatal + abonoFamilia + abonoParaFalhas;

    const result = salarioBase + totalSubsidios;
    return isNaN(result) ? 0 : result;
  }

  /**
   * Verifica se é necessário recalcular IRT e SS
   */
  private precisaRecalculo(folhaData: Partial<FolhaSalario>): boolean {
    const camposAfetados: (keyof FolhaSalario)[] = [
      'salario_base', 'horas_extras', 'bonus', 'premios', 'outros_subsidios',
      'subsidio_alimentacao', 'subsidio_transporte', 'subsidio_noturno',
      'subsidio_de_turno', 'subsidio_de_risco', 'subsidio_de_representacao',
      'subsidio_de_regencia', 'subsidio_de_renda', 'subsidio_de_disponibilidade',
      'subsidio_de_exame', 'subsidio_de_atavio', 'subsidio_de_ferias',
      'subsidio_de_natal', 'abono_familia', 'abono_para_falhas'
    ];

    return camposAfetados.some(campo => folhaData[campo] !== undefined);
  }

  /**
   * Recalcula IRT e Segurança Social para um colaborador quando uma falta é aprovada
   */
  public async recalcularSalarioPorFaltaAprovada(colaboradorId: number, dataFalta: string): Promise<void> {
    try {
      // Extrair mês e ano da data da falta
      const data = new Date(dataFalta);
      const mes = data.getMonth() + 1; // getMonth() retorna 0-11
      const ano = data.getFullYear();

      console.log(`🔄 [DEBUG] Recalculando salário para colaborador ${colaboradorId} no mês ${mes}/${ano}`);

      // Buscar folha de salário do colaborador no mês/ano
      const folha = await FolhaSalario.query()
        .where('id_colaborador', colaboradorId)
        .where('mes', mes)
        .where('ano', ano)
        .first();

      if (!folha) {
        console.log(`⚠️ [DEBUG] Folha não encontrada para colaborador ${colaboradorId} em ${mes}/${ano}`);
        return;
      }

      console.log(`📋 [DEBUG] Folha encontrada ID: ${folha.id}, Status: ${folha.status}`);
      console.log(`📋 [DEBUG] Folha dados atuais:`, {
        total_faltas_valor: folha.total_faltas_valor,
        falta_justificada_qtd: folha.falta_justificada_qtd,
        faltas_nao_justificadas_qtd: folha.faltas_nao_justificadas_qtd,
        total_faltas: folha.total_faltas
      });

      // Buscar faltas justificadas e não justificadas do colaborador no mês
      const faltasDoMes = await this.buscarFaltasDoMes(colaboradorId, mes, ano);
      
      console.log(`🔍 [DEBUG] Faltas do mês encontradas: ${faltasDoMes.length}`);
      console.log(`🔍 [DEBUG] Faltas do mês:`, faltasDoMes.map(f => ({ id: f.id, tipo: f.tipo, duracao: f.duracao, estado: f.estado })));

      // Calcular descontos por faltas
      const descontosFaltas = this.calcularDescontosPorFaltas(folha, faltasDoMes);
      
      console.log(`💰 [DEBUG] Descontos por faltas calculados:`, descontosFaltas);

      // Calcular valores individuais para salvar no banco
      const salarioBase = parseFloat(String(folha.salario_base || 0));
      const subsidioAlimentacao = parseFloat(String(folha.subsidio_alimentacao || 0));
      const subsidioTransporte = parseFloat(String(folha.subsidio_transporte || 0));
      const diasUteis = 22;
      
      // Validar que todos os valores são números válidos
      if (isNaN(salarioBase) || isNaN(subsidioAlimentacao) || isNaN(subsidioTransporte)) {
        console.error(`❌ [DEBUG] Valores inválidos na folha:`, {
          salarioBase,
          subsidioAlimentacao,
          subsidioTransporte
        });
        return;
      }
      
      const descontoPorFaltasNjus = (salarioBase + subsidioAlimentacao + subsidioTransporte) / diasUteis;
      const descontoPorFaltasJus = (subsidioAlimentacao + subsidioTransporte) / diasUteis;
      
      const faltaJustificadaValor = descontoPorFaltasJus * descontosFaltas.justificadas;
      const faltasNaoJustificadasValor = descontoPorFaltasNjus * descontosFaltas.naoJustificadas;
      const totalFaltasQtd = descontosFaltas.justificadas + descontosFaltas.naoJustificadas;

      // Validar resultados
      if (isNaN(faltaJustificadaValor) || isNaN(faltasNaoJustificadasValor) || isNaN(descontosFaltas.valorTotal)) {
        console.error(`❌ [DEBUG] Valores calculados inválidos:`, {
          faltaJustificadaValor,
          faltasNaoJustificadasValor,
          valorTotal: descontosFaltas.valorTotal
        });
        return;
      }

      // Atualizar a folha com os descontos e quantidades de faltas
      console.log(`📝 [DEBUG] Atualizando folha ${folha.id} com:`, {
        total_faltas_valor: descontosFaltas.valorTotal,
        falta_justificada_qtd: descontosFaltas.justificadas,
        faltas_nao_justificadas_qtd: descontosFaltas.naoJustificadas,
        falta_justificada_valor: faltaJustificadaValor,
        faltas_nao_justificadas_valor: faltasNaoJustificadasValor,
        total_faltas: totalFaltasQtd
      });

      try {
        const updateResult = await FolhaSalario.query()
          .where('id', folha.id)
          .update({
            total_faltas_valor: descontosFaltas.valorTotal,
            falta_justificada_qtd: descontosFaltas.justificadas,
            faltas_nao_justificadas_qtd: descontosFaltas.naoJustificadas,
            falta_justificada_valor: faltaJustificadaValor,
            faltas_nao_justificadas_valor: faltasNaoJustificadasValor,
            total_faltas: totalFaltasQtd
          });

        console.log(`✅ [DEBUG] Folha atualizada com sucesso. Linhas afetadas:`, updateResult);
      } catch (updateError) {
        console.error(`❌ [DEBUG] Erro ao atualizar folha:`, updateError);
        throw updateError;
      }

      // Recalcular IRT e SS com os novos valores
      // Buscar folha atualizada para garantir que temos os dados mais recentes
      const folhaAtualizada = await FolhaSalario.query()
        .where('id', folha.id)
        .first();
      
      if (folhaAtualizada) {
        await this.recalcularIRTETotais(folhaAtualizada);
      }

      console.log(`✅ [DEBUG] Salário recalculado com sucesso para colaborador ${colaboradorId}`);

    } catch (error) {
      console.error('❌ [DEBUG] Erro ao recalcular salário por falta aprovada:', error);
      throw error;
    }
  }

  /**
   * Busca faltas justificadas e não justificadas de um colaborador no mês
   */
  private async buscarFaltasDoMes(colaboradorId: number, mes: number, ano: number): Promise<any[]> {
    // Importar Falta dinamicamente para evitar dependência circular
    const { default: Falta } = await import('../models/falta.js');
    
    return await Falta.query()
      .where('colaborador_id', colaboradorId)
      .where('tipo', 'in', ['falta_justificada', 'falta_injustificada'])
      .where('estado', 'aprovado')
      .where((query) => {
        query
          .whereRaw('MONTH(data_inicio) = ?', [mes])
          .whereRaw('YEAR(data_inicio) = ?', [ano]);
      })
      .exec();
  }

  /**
   * Calcula descontos por faltas
   */
  private calcularDescontosPorFaltas(folha: FolhaSalario, faltas: any[]): {
    valorTotal: number;
    justificadas: number;
    naoJustificadas: number;
  } {
    const salarioBase = parseFloat(String(folha.salario_base || 0));
    const subsidioAlimentacao = parseFloat(String(folha.subsidio_alimentacao || 0));
    const subsidioTransporte = parseFloat(String(folha.subsidio_transporte || 0));
    const diasUteis = 22; // Padrão de dias úteis
    
    // Validar valores da folha
    if (isNaN(salarioBase) || isNaN(subsidioAlimentacao) || isNaN(subsidioTransporte)) {
      console.error(`❌ [DEBUG] Valores da folha inválidos:`, {
        salarioBase,
        subsidioAlimentacao,
        subsidioTransporte
      });
      return {
        valorTotal: 0,
        justificadas: 0,
        naoJustificadas: 0
      };
    }
    
    let justificadas = 0;
    let naoJustificadas = 0;
    let valorTotal = 0;

    // Fórmulas para desconto por falta (mesmas do frontend)
    const descontoPorFaltasNjus = (salarioBase + subsidioAlimentacao + subsidioTransporte) / diasUteis;
    const descontoPorFaltasJus = (subsidioAlimentacao + subsidioTransporte) / diasUteis;

    faltas.forEach(falta => {
      const duracao = falta.duracao || 1;
      
      if (falta.tipo === 'falta_justificada') {
        justificadas += duracao;
        valorTotal += descontoPorFaltasJus * duracao;
      } else if (falta.tipo === 'falta_injustificada') {
        naoJustificadas += duracao;
        valorTotal += descontoPorFaltasNjus * duracao;
      }
    });

    return {
      valorTotal: parseFloat(valorTotal.toFixed(2)),
      justificadas,
      naoJustificadas
    };
  }

  /**
   * Calcula IRT e Segurança Social para uma folha
   */
  private async calcularIRTESS(folhaData: any): Promise<{ irt: number, ss: number }> {
    try {
      // Preparar dados para cálculo do IRT
      const dadosCalculoIRT = {
        salario_base: folhaData.salario_base || 0,
        abono_familia: folhaData.abono_familia || 0,
        ss: 0.03,
        outros_rendimento: (folhaData.horas_extras || 0),
        outros_subsidios: (folhaData.outros_subsidios || 0) +  (folhaData.subsidio_de_representacao || 0) + (folhaData.subsidio_de_disponibilidade || 0) + (folhaData.subsidio_de_atavio || 0) + (folhaData.subsidio_de_renda || 0) + (folhaData.subsidio_de_risco || 0) + (folhaData.subsidio_noturno || 0) + (folhaData.subsidio_de_exame || 0) + (folhaData.subsidio_de_turno || 0) + (folhaData.subsidio_de_regencia || 0),
        subsidio_natal: parseFloat(String(folhaData.subsidio_de_natal || 0)),
        subsidio_representacao: folhaData.subsidio_de_representacao || 0,
        subsidio_disponibilidade: folhaData.subsidio_de_disponibilidade || 0,
        sub_atavio: folhaData.subsidio_de_atavio || 0,
        premios: folhaData.premios || 0,
        horas_extras: folhaData.horas_extras || 0,
        bonus: folhaData.bonus || 0,
        subsidio_ferias: folhaData.subsidio_de_ferias || 0,
        subsidio_alimentacao: folhaData.subsidio_alimentacao || 0,
        subsidio_transporte: folhaData.subsidio_transporte || 0
      };

      // Calcular matéria coletável e IRT
      const materiaColetavelIRT = await this.calcularMateriaColetavelIRT({
        funcionario: { instalacao: { dias_uteis: 22 } }, // Mock para cálculo
        faltaJustificadaQtd: folhaData.faltas_justificadas_qtd || 0,
        faltasNaoJustificadasQtd: folhaData.faltas_nao_justificadas_qtd || 0,
        totalFaltasValor: folhaData.total_faltas_valor || 0
      }, dadosCalculoIRT);

       const irt = await this.calcularIRT(materiaColetavelIRT);
      const totalBruto = this.calcularTotalBruto(folhaData);
      const ss = (totalBruto || 0) * 0.03;

      return { irt: irt || 0, ss };
    } catch (error) {
      console.error('Erro ao calcular IRT e SS:', error);
      return { irt: 0, ss: 0 };
    }
  }
}
