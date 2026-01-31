import { DateTime } from 'luxon'
import ReporteSaft from '../../gestao_comercial/models/ReporteSaft.js'
import Documento from '../models/Documento.js'
import Cliente from '../models/Cliente.js'
import Produto from '../models/Produto.js'
import { Builder } from 'xml2js'
import DocumentoItem from '../models/DocumentoItem.js'
interface PaymentMechanismMap {
  [key: string]: string;
  'Transferência': string;
  'Multicaixa': string;
  'Multibanco': string;
  'Dinheiro': string;
}
export default class ReporteSaftService {
  async listAll(page: number = 1, limit: number = 10) {
    return await ReporteSaft.query().paginate(page, limit)
  }

  async list() {
    return await ReporteSaft.all()
  }

  async findById(id: number) {
    return await ReporteSaft.findOrFail(id)
  }



  async update(id: number, data: Partial<ReporteSaft>) {
    const reporteSaft = await ReporteSaft.findOrFail(id)
    reporteSaft.merge(data)
    await reporteSaft.save()
    return reporteSaft
  }

  async delete(id: number) {
    const reporteSaft = await ReporteSaft.findOrFail(id)
    await reporteSaft.delete()
  }

  /**  
   * Generate SAF-T XML for a specific report
   */
  async generateSaftXml(reportId: number): Promise<string | null> {
    try {
      console.log(`🔄 Starting SAF-T generation for report ${reportId}`)

      // Inicializa as variáveis de totais 
      let taxPayable = 0;
      let netTotal = 0;
      let GrossTotal = 0;
      let nota_credito_total = 0;
      let desconto_sumario = 0;

      let DEBIT = 0; // Inicialize a variável fora do loop
      let CREDIT = 0; // Inicialize a variável fora do loop

      function round2(value: number) {
        return Math.round((value + Number.EPSILON) * 100) / 100;
      }
      // Mapeamento de id_tipo_fatura para InvoiceType
      function getInvoiceType(doc: any): string {
        // 1️⃣ Lista de tipos de documento válidos
        const validTypes = [
          'FT', // Fatura
          'FR', // Fatura-Recibo
          'VD', // Venda a Dinheiro
          'GF', // Guia Fatura
          'FG', // Fatura/Guia
          'AC', // Alteração de Fatura
          'ND', // Nota de Débito
          'NC', // Nota de Crédito
          'AF', // Auto Faturação
          'TV', // Talão de Venda
          'AA', // Alienacao de activos
          'DA', // Alienacao de DEVOLUCAO
          'RP', // Primio ou recibo de premio
          'AR', // Aviso de cobrança/recibo
          'CS', // Imputação e co-seguradora 
          'LD', // Imputação a co-seguradora lider
          'RA'  // Resseguro Aceite
        ];

        // 2️⃣ Tenta obter do mapeamento por id_tipo_fatura
        if (doc.id_tipo_fatura && getInvoiceType(doc.id_tipo_fatura)) {
          const mappedType = getInvoiceType(doc.id_tipo_fatura);
          if (validTypes.includes(mappedType)) {
            return mappedType;
          }
        }

        // 3️⃣ Tenta extrair da referência (2 primeiros caracteres)
        if (doc.referencia && doc.referencia.length >= 2) {
          const refType = doc.referencia.substring(0, 2).toUpperCase();
          if (validTypes.includes(refType)) {
            return refType;
          }
        }

        // 4️⃣ Se não encontrar um tipo válido, usa "FT" como padrão
        return 'FT';
      }

      const getTaxCode = (taxRate: number): string => {
        if (taxRate === 0) return 'ISE';  // Isento
        if (taxRate === 2) return 'RED';  // Reduzido
        if (taxRate === 5) return 'INT';  // Intermédio
        if (taxRate === 14) return 'NOR'; // Normal
        return 'OUT';                     // Outro
      };

      function parseDate(date: any): DateTime {
        try {
          if (!date) {
            console.log('⚠️ Data não fornecida, usando data atual');
            return DateTime.now();
          }
          if (typeof date === 'string') {
            const parsed = DateTime.fromISO(date);
            if (parsed.isValid) return parsed;
          }
          if (DateTime.isDateTime(date)) return date;
          if (date instanceof Date) return DateTime.fromJSDate(date);
          if (date.toISOString) return DateTime.fromISO(date.toISOString());

          console.warn('⚠️ Tipo de data não reconhecido:', {
            type: typeof date,
            value: date,
            constructor: date?.constructor?.name
          });
          return DateTime.now();
        } catch (error) {
          console.error('❌ Erro ao fazer parse da data:', error);
          return DateTime.now();
        }
      }
      // Buscar o relatório e empresa
      const report = await ReporteSaft.query()
        .where('id', reportId)
        .preload('empresa')
        .firstOrFail()

      if (!report.empresa) {
        throw new Error(`Empresa não encontrada para o relatório ${reportId}`)
      }

      // Formatar datas para query
      const startDate = report.dataInicio.toFormat('yyyy-MM-dd HH:mm:ss')
      const endDate = report.dataFim.toFormat('yyyy-MM-dd HH:mm:ss')

      console.log(`📅 Fetching documents between ${startDate} and ${endDate} for empresa ${report.empresa.id}`)

      const documentos = await Documento.query()
        .where('id_empresa', report.empresa.id)
        .where('data_criacao', '>=', startDate)
        .where('data_criacao', '<=', endDate)
        .preload('cliente')  // Adiciona o carregamento do cliente
        .preload('itens')    // Mantém os preloads existentes
        .preload('tipoDocumento'); // Mantém os preloads existentes

      console.log(`📄 Found ${documentos.length} documents for the report period`)

      if (documentos.length === 0) {
        console.warn('⚠️ Nenhum documento encontrado para o período especificado.')
      }

      // Ano fiscal e data atual
      const now = new Date().toISOString()
      const fiscalYear = new Date(report.dataInicio!.toJSDate()).getFullYear()


      const getPaymentMechanism = (meioPagamento: string): string => {
        const paymentMap: PaymentMechanismMap = {
          'Transferência': 'TB',
          'Multicaixa': 'MB',
          'Multibanco': 'MB',
          'Dinheiro': 'NU'
        };
        return paymentMap[meioPagamento] || 'TB'; //OTHR
      }

      // Montar estrutura básica SAF-T
      const saftData = {
        'AuditFile': {
          '$': {
            'xmlns': 'urn:OECD:StandardAuditFile-Tax:AO_1.01_01',
            'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
          },
          'Header': {
            'AuditFileVersion': '1.01_01', //A
            'CompanyID': report.empresa.nif, //B
            'TaxRegistrationNumber': report.empresa.nif, //C
            'TaxAccountingBasis': 'F', //D
            'CompanyName': report.empresa.nome_comercial ? report.empresa.nome_comercial.toUpperCase() : '', //E
            'CompanyAddress': {
              'AddressDetail': report.empresa.endereco ? report.empresa.endereco.toUpperCase() : '', //F
              'City': 'Luanda', //G
              'PostalCode': '0000', //H
              'Country': 'AO' //I
            },
            'FiscalYear': fiscalYear.toString(), //J
            'StartDate': report.dataInicio.startOf('month').toFormat('yyyy-MM-dd'), //K - Primeiro dia do mês
            'EndDate': report.dataInicio.endOf('month').toFormat('yyyy-MM-dd'), //L - Último dia do mês
            'CurrencyCode': 'AOA', //M
            'DateCreated': report.dataInicio.endOf('month').toFormat('yyyy-MM-dd') > new Date().toISOString() ? report.dataInicio.endOf('month').toFormat('yyyy-MM-dd') : new Date().toISOString(),  //N
            'TaxEntity': 'Global', //O
            'ProductCompanyTaxID': report.empresa.nif, //P
            'SoftwareValidationNumber': '31.1/AGT2025', //Q
            'ProductID': 'TATU ERP/TATU SOLUTIONS - COMERCIO E SERVICOS', //R
            'ProductVersion': '1.0.0' //S
          },
          'MasterFiles': {
            'Customer': await (async () => {
              // Get all unique customer IDs from the documents and ensure they are valid numbers
              const customerIds = [...new Set(
                documentos
                  .map(doc => Number(doc.clienteId))
                  .filter(id => !isNaN(id) && id > 0)
              )];

              // Busca todos os clientes que possuem documentos neste período
              const clientes = await Cliente.query()
                .whereIn('id', customerIds)
                .where('id_empresa', report.empresa.id)
                .select('id', 'nome', 'nif', 'endereco', 'id_provincia', 'telefone', 'email')
                .preload('provincia');

              // Array auxiliar para evitar duplicados
              const clientesAdicionados = new Set();
              // Mapeamento para o formato SAF-T
              const customersList = [
                ...clientes
                  .filter(cliente => cliente.id !== 1) // ignora consumidor final
                  .filter(cliente => {
                    // chave única — evita duplicados por ID, NIF ou nome
                    const chave =
                      cliente.id?.toString() ||
                      cliente.nif?.toString() ||
                      cliente.nome?.trim();
                    if (!clientesAdicionados.has(chave)) {
                      clientesAdicionados.add(chave);
                      return true;
                    }
                    return false;
                  })
                  .map(cliente => {
                    const endereco = cliente.endereco || '';
                    const valorEndereco =
                      endereco.trim() !== '' && /[A-Za-z]/.test(endereco)
                        ? endereco
                        : 'Desconhecido';

                    return {
                      CustomerID: cliente.id.toString(), // T
                      AccountID: 'Desconhecido', // U
                      'CustomerTaxID': cliente.nif && /^[0-9]{9}$/.test(cliente.nif) ? cliente.nif : '999999999', // V
                      CompanyName: cliente.nome, // W
                      BillingAddress: {
                        AddressDetail: valorEndereco, // X
                        City: cliente.provincia?.nome || 'Desconhecido', // Y
                        PostalCode: cliente.codigoPostal ? cliente.codigoPostal : 'Desconhecido', // Z
                        Country: 'AO', // AA
                      },
                      SelfBillingIndicator: '0', // AB
                    };
                  }),
                // Add default customer
                {
                  'CustomerID': '1',
                  'AccountID': 'Desconhecido',
                  'CustomerTaxID': '999999999',
                  'CompanyName': 'Consumidor Final',
                  'BillingAddress': {
                    'AddressDetail': 'Desconhecido',
                    'City': 'Desconhecido',
                    'PostalCode': 'Desconhecido',
                    'Country': 'AO'
                  },
                  'SelfBillingIndicator': '0'
                }
              ];

              return customersList;
            })(),

            'Product': await (async () => {
              // Coletar todos os IDs de produtos únicos dos itens dos documentos
              const produtoIds = new Set<number>();

              documentos.forEach(doc => {
                doc.itens?.forEach(item => {
                  if (parseDate(doc.dataCriacao).toFormat('yyyy-MM') === report.dataInicio.toFormat('yyyy-MM')) {
                    // Verifica se item.documento existe antes de acessar suas propriedades
                    const tipoDocumentoId = item.documento?.tipoDocumentoId || doc.tipoDocumentoId;
                    const dataCriacao = item.documento?.dataCriacao || doc.dataCriacao;

                    if (tipoDocumentoId != 2 && item.produtoId) {
                      const itemDate = typeof dataCriacao === 'string'
                        ? DateTime.fromISO(dataCriacao)
                        : DateTime.isDateTime(dataCriacao)
                          ? dataCriacao
                          : DateTime.now();

                      produtoIds.add(item.produtoId);
                    }
                  }
                });
              });

              if (produtoIds.size === 0) return [];

              // Buscar todos os produtos únicos
              const produtos = await Produto.query()
                .whereIn('id', Array.from(produtoIds))
                .where('id_empresa', report.empresa.id);

              // Mapear para o formato SAF-T
              return produtos.map(produto => ({
                'ProductType': produto.id_tipo_produto === 1 ? 'P' : (produto.id_tipo_produto === 2 ? 'P' : produto.id_tipo_produto === 3 ? 'S' : 'O'),  // S para Serviço, P para Produto //AC
                'ProductCode': produto.id.toString(), //AD
                'ProductDescription': produto.nome || 'Produto sem descrição', //AE
                'ProductNumberCode': produto.referencia || produto.id.toString(), //AF
                // Adicione outros campos específicos do produto, se necessário
              }));
            })(),
            'TaxTable': {
              'TaxTableEntry': (() => {

                const taxRates = new Set<number>();
                // Percorre todos os documentos
                documentos.forEach(doc => {
                  doc.itens?.forEach(item => {
                    // Usa o documento do item, se existir, senão o documento principal
                    const docItem = item.documento || doc;
                    const tipoDocumentoId = docItem.tipoDocumentoId;
                    // Ignora tipoDocumentoId 2 (caso especial, ex: rascunho ou interno)
                    if (tipoDocumentoId != 2 && item.iva != null) {
                      // Adiciona taxa de IVA única
                      taxRates.add(Number(item.iva));
                    }
                  });


                  if (doc.tipoDocumentoId != 2) {
                    if (parseDate(doc.dataCriacao).toFormat('yyyy-MM') == report.dataInicio.toFormat('yyyy-MM')) {
                      doc.itens?.forEach(item => {
                        if (!item || item.iva == null) return;

                        if (doc.tipoDocumentoId == 11) {
                          DEBIT += Number((item.precoUnitario * item.quantidade).toFixed(6));
                        }

                        if (doc.nomeDocumentoId == 1 || doc.nomeDocumentoId == 2 || doc.nomeDocumentoId == 9 || doc.nomeDocumentoId == 10) {
                          const descontoCredit = (!item.descontoFora ? (item.descontoFora == "monetario" ? item.desconto : (item.precoUnitario * item.quantidade) * (item.desconto / 100)) : 0) || 0;
                          CREDIT += Number((item.precoUnitario * item.quantidade).toFixed(6)) - descontoCredit;
                        }
                      });
                    }
                  }
                });

                // Se não houver itens, usar taxas padrão
                const defaultRates = [0, 2, 5, 14]; // Taxas padrão: isento, 2%, 5%, 14%
                const ratesToUse = taxRates.size > 0 ? Array.from(taxRates) : defaultRates;


                // Funções auxiliares
                const getTaxCode = (taxRate: number): string => {
                  if (taxRate === 0) return 'ISE'; // Isento
                  if (taxRate === 2) return 'RED'; // Reduzido
                  if (taxRate === 5) return 'INT'; // Intermédio
                  if (taxRate === 14) return 'NOR'; // Normal
                  return 'OUT'; // Outro
                };
                const getTaxDescription = (taxRate: number): string => {
                  if (taxRate === 0) return 'Isento de IVA';
                  if (taxRate === 2) return 'IVA Reduzido 2%';
                  if (taxRate === 5) return 'IVA Intermédio 5%';
                  if (taxRate === 14) return 'IVA Normal 14%';
                  return `Outro IVA ${taxRate}%`;
                };

                // Mapear para o formato SAF-T
                return ratesToUse.map(rate => {
                  const taxCode = getTaxCode(rate);
                  return {
                    'TaxType': 'IVA',
                    'TaxCountryRegion': 'AO',
                    'TaxCode': taxCode,
                    'Description': getTaxDescription(rate),
                    'TaxPercentage': rate ? rate.toString() : '0'
                  };
                });
              })()
            },
          },
          'SourceDocuments': {
            'SalesInvoices': {
              'NumberOfEntries': documentos
                .filter(doc => {
                  if (!doc || doc.tipoDocumentoId === 2) return false;
                  // Excluir tipos de documento específicos
                  const excludedTypes = [7, 6, 8, 12, 13]; // 2=Rascunho, 7=GT, 8=GR, 13=RE
                  if (!doc || excludedTypes.includes(doc.nomeDocumentoId)) return false;

                  const docDate = parseDate(doc.dataCriacao);
                  const hasValidItems =
                    Array.isArray(doc.itens) &&
                    doc.itens.some(item =>
                      item?.quantidade > 0 &&
                      item.precoUnitario !== undefined &&
                      item.descricao?.trim()
                    );

                  return (
                    docDate.isValid &&
                    docDate.toFormat('yyyy-MM') === report.dataInicio.toFormat('yyyy-MM') &&
                    hasValidItems
                  );
                })
                .length.toString(),
              'TotalDebit': Number(DEBIT),
              'TotalCredit': Number(CREDIT),
              'Invoice': documentos
                .filter(doc => {
                  if (!doc || doc.tipoDocumentoId === 2) return false;
                  // Excluir tipos de documento específicos
                  const excludedTypes = [7, 6, 8, 12, 13]; // 2=Rascunho, 7=GT, 8=GR, 13=RE
                  if (!doc || excludedTypes.includes(doc.nomeDocumentoId)) return false;

                  const docDate = parseDate(doc.dataCriacao);
                  const hasValidItems =
                    Array.isArray(doc.itens) &&
                    doc.itens.some(item =>
                      item?.quantidade > 0 &&
                      item.precoUnitario !== undefined &&
                      item.descricao?.trim()
                    );

                  return (
                    docDate.isValid &&
                    docDate.toFormat('yyyy-MM') === report.dataInicio.toFormat('yyyy-MM') &&
                    hasValidItems
                  );
                })
                .map(doc => {
                  const docDate = parseDate(doc.dataCriacao);
                  const itens = Array.isArray(doc.itens) ? doc.itens : [];

                  // Inicialização de totais
                  let netTotal = 0;
                  let taxPayable = 0;
                  let grossTotal = 0;

                  // Processamento dos itens
                  const linhas = itens
                    .filter(item =>
                      item?.quantidade > 0 &&
                      item.precoUnitario !== undefined &&
                      item.descricao?.trim()
                    )
                    .map((item, idx) => {
                      if (docDate.toFormat('yyyy-MM') === report.dataInicio.toFormat('yyyy-MM')) {
                        if (doc.tipoDocumentoId != 2) {
                          if (doc.nomeDocumentoId != 7 && doc.nomeDocumentoId != 8) {

                            const quantidade = Math.max(0, Number(item.quantidade || 0));
                            const precoUnitario = Math.max(0, Number(item.precoUnitario || 0));
                            const lineTotal = quantidade * precoUnitario;
                            const taxRate = Math.max(0, Math.min(100, Number(item.iva ?? 14)));
                            const taxCode = getTaxCode(taxRate);
                            const descricao = (item.descricao || '').trim() || 'Produto sem descrição';
                            const lineTax = (lineTotal * taxRate) / 100;
                            const desconto = 0;

                            // Atualiza totais
                            netTotal += lineTotal;
                            taxPayable += lineTax;

                            let DebitAmount = 0;
                            let CreditAmount = 0;
                            if (item.documento?.tipoDocumentoId == 11) {
                              DebitAmount = Number((item.precoUnitario * item.quantidade).toFixed(6));
                            } else {
                              const descontoCreditAmount = (!item.descontoFora ? (item.descontoFora == "monetario" ? item.desconto : (item.precoUnitario * item.quantidade) * (item.desconto / 100)) : 0) || 0;
                              CreditAmount = Number((item.precoUnitario * item.quantidade).toFixed(6)) - descontoCreditAmount;
                            }

                            return {
                              'LineNumber': (idx + 1).toString().padStart(3, '0'),
                              'ProductCode': item.produtoId?.toString() || 'N/A',
                              'ProductDescription': descricao.substring(0, 100),
                              'Quantity': quantidade.toFixed(2),
                              'UnitOfMeasure': (item.unidadeMedida || 'Uni').substring(0, 10),
                              'UnitPrice': precoUnitario.toFixed(6),
                              'TaxPointDate': docDate.toFormat('yyyy-MM-dd'),
                              ...(item.documento?.nomeDocumentoId == 11 ? {
                                'References': {
                                  'Reference': item.documento?.relacionada?.referencia ? item.documento?.relacionada?.referencia : "",
                                  'Reason': (!item.documento?.observacoes ? item.documento?.observacoes : ""),
                                },
                              } : {}),
                              'Description': descricao.substring(0, 200),
                              ...(item.documento?.nomeDocumentoId == 11 ? {
                                'DebitAmount': DebitAmount,
                              } : {
                                'CreditAmount': CreditAmount,
                              }),
                              'Tax': {
                                'TaxType': 'IVA',
                                'TaxCountryRegion': 'AO',
                                'TaxCode': taxCode,
                                'TaxPercentage': taxRate.toFixed(0),
                              },
                              ...(taxRate == 0 ? {
                                'TaxExemptionReason': (item.produto?.motivoRegime?.description ? item.produto?.motivoRegime?.description : "Transmissão de bens e serviço não sujeita"),
                                'TaxExemptionCode': (item.produto?.motivoRegime?.code ? item.produto?.motivoRegime?.code : "M02")
                              } : {}),
                              'SettlementAmount': desconto.toFixed(2),
                            };
                          }
                        }
                      }
                    });

                  // Cálculo dos totais finais
                  grossTotal = netTotal + taxPayable;
                  const isRetencao = doc.cliente?.is_retencao || doc.cliente?.retencao === 1;
                  const retention = isRetencao ? grossTotal * 0.065 : 0;

                  // Construir o objeto da fatura
                  const invoice = {
                    '$': {
                      'xsi:type': 'salesinvoice'
                    },
                    'InvoiceNo': String(doc.referencia),
                    'DocumentStatus': {
                      'InvoiceStatus': 'N',
                      'InvoiceStatusDate': parseDate(doc.createdAtLocal).toFormat("yyyy-MM-dd'T'HH:mm:ss"),
                      'SourceID': doc.userId?.toString() || '1',
                      'SourceBilling': 'P',
                      ...(doc.motivoEmissao && { 'Reason': doc.motivoEmissao })
                    },
                    'Hash': doc.hash || '',
                    'HashControl': doc.hash ? '1' : '0',
                    'Period': docDate.toFormat('MM'),
                    'InvoiceDate': docDate.toFormat('yyyy-MM-dd'),
                    'InvoiceType': getInvoiceType(doc),
                    'SpecialRegimes': {
                      'SelfBillingIndicator': doc.nomeDocumentoId === 12 ? '1' : '0',
                      'CashVATSchemeIndicator': '0',
                      'ThirdPartiesBillingIndicator': '0'
                    },
                    'SourceID': doc.userId?.toString() || '1',
                    'SystemEntryDate': parseDate(doc.createdAtLocal).toFormat("yyyy-MM-dd'T'HH:mm:ss"),
                    'CustomerID': doc.clienteId?.toString() || '0',
                    'Line': linhas,
                    'DocumentTotals': {
                      'TaxPayable': taxPayable.toFixed(2),   //TOTAL IVA
                      'NetTotal': netTotal.toFixed(2),   // TOTAL SUBTOTAL
                      'GrossTotal': grossTotal.toFixed(2), //TOTAL SUBTOTAL + TOTAL IVA
                      ...(doc.meioPagamento ? {
                        'Payment': [{
                          'PaymentMechanism': getPaymentMechanism(doc.meioPagamento),
                          'PaymentAmount': grossTotal.toFixed(2),
                          'PaymentDate': docDate.toFormat('yyyy-MM-dd')
                        }]
                      } : {})
                    },
                    ...(retention > 0 ? {
                      'WithholdingTax': [{
                        'WithholdingTaxType': 'II',
                        'WithholdingTaxDescription': 'Art 67 do CII',
                        'WithholdingTaxAmount': retention.toFixed(2)
                      }]
                    } : {})
                  };

                  return invoice;
                })
            }
          }
        }
      }

      // Converter objeto em XML com opções otimizadas
      const builder = new Builder({
        xmldec: {
          version: '1.0',
          encoding: 'UTF-8',
          standalone: true
        },
        renderOpts: {
          pretty: true,
          indent: '  ',
          newline: '\n'
        },
        headless: false,
        allowSurrogateChars: true,
        cdata: true,
        attrkey: '$',
        charkey: '_'
      })

      try {
        // Debug: Check for circular references or invalid values
        const checkForCircular = (obj: any, path: string[] = []): void => {
          if (obj === null || typeof obj !== 'object') return;

          if (path.includes(obj)) {
            throw new Error(`Circular reference detected at path: ${path.join('.')}`);
          }

          for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
              checkForCircular(obj[key], [...path, key]);
            } else if (typeof obj[key] === 'function' || typeof obj[key] === 'symbol') {
              throw new Error(`Invalid value type (${typeof obj[key]}) at path: ${[...path, key].join('.')}`);
            }
          }
        };

        checkForCircular(saftData);

        const xml = builder.buildObject(saftData);
        console.log('✅ SAF-T XML gerado com sucesso!');
        return xml;
      } catch (error) {
        console.error('❌ Erro ao converter para XML:', error)
        throw new Error('Falha ao gerar o XML do SAF-T')
      }

    } catch (error) {
      console.error('❌ Error generating SAF-T XML:', error)
      if (error.code) console.error('Error code:', error.code)
      if (error.sql) console.error('SQL Query:', error.sql)
      throw error
    }
  }


  async create(data: any) {
    try {
      // 1️⃣ Contar documentos dentro do intervalo (sem preload)
      const result = await Documento.query()
        .where('id_empresa', data.id_empresa)
        .whereBetween('data_criacao', [data.data_inicio, data.data_fim])
        .count('* as total')
        .first() as { total: string | number } | null

      let totalDocumentos = result ? Number(result.total) : 0

      // 2️⃣ Se não encontrou, tenta buscar documentos reais (com preload)
      if (totalDocumentos === 0) {
        console.warn('⚠️ Nenhum documento encontrado na contagem. Buscando diretamente na tabela Documentos...')

        const documentos = await Documento.query()
          .where('id_empresa', data.id_empresa)
          .whereBetween('data_criacao', [data.data_inicio, data.data_fim])
          .preload('itens')
          .preload('tipoDocumento')

        totalDocumentos = documentos.length
        console.log('📄 Total encontrado via fallback:', totalDocumentos)
      }

      // 3️⃣ Se ainda assim não encontrou nada
      if (totalDocumentos === 0) {
        console.warn('🚫 Nenhum documento encontrado após verificação completa.')

        return {
          success: false,
          message: 'Nenhum documento encontrado para o intervalo informado.',
          data: {
            total_documentos: 0,
            data_inicio: data.data_inicio,
            data_fim: data.data_fim,
          },
        }
      }

      // 4️⃣ Converter datas
      const dataInicio = DateTime.fromISO(data.data_inicio)
      const dataFim = DateTime.fromISO(data.data_fim)

      // 5️⃣ Criar o relatório
      const report = await ReporteSaft.create({
        dataInicio,
        dataFim,
        totalDocumentos,
        userId: data.id_usuario,
        empresaId: data.id_empresa,
        estado: 'concluido',
      })

      console.log('✅ Relatório criado com sucesso:', report)

      // 6️⃣ Retornar sucesso
      return {
        success: true,
        message: 'Relatório criado com sucesso',
        data: {
          ...report.toJSON(),
          total_documentos: totalDocumentos,
          data_inicio: dataInicio.toFormat('yyyy-MM-dd'),
          data_fim: dataFim.toFormat('yyyy-MM-dd'),
        },
      }
    } catch (error) {
      console.error('❌ Erro em ReporteSaftService.create:', error)
      throw error
    }
  }
}