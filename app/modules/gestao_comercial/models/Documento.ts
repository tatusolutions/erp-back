import { BaseModel, column, belongsTo, hasMany, beforeCreate, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import TipoDocumento from './TipoDocumento.js'
import NomeDocumento from './NomeDocumento.js'
import { DateTime } from 'luxon'
import DocumentoItem from './DocumentoItem.js'
import Cliente from './Cliente.js'
import app from '@adonisjs/core/services/app'
import { readFileSync } from 'fs'
import { createSign } from 'crypto'
import Moeda from '../../form_control_geral/models/Moeda.js'
import RSA from '../../../Utils/RSA.js'
import { Buffer } from 'buffer'
async function retry<T>(
  // @ts-ignore - fn is used in the function body
  fn: ((bail: (e: Error) => void) => Promise<T>) | (() => Promise<T>),
  options: { retries: number; minTimeout: number; maxTimeout: number }
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i <= options.retries; i++) {
    try {
      return await fn((e: Error) => {
        throw e; // Or handle the error as needed
      });
    } catch (error) {
      lastError = error as Error
      if (i === options.retries) break
      await new Promise(resolve =>
        setTimeout(resolve, Math.min(options.minTimeout * Math.pow(2, i), options.maxTimeout))
      )
    }
  }

  throw lastError || new Error('Retry failed')
}

export default class Documento extends BaseModel {
  public static table = 'documentos' // Especifica o nome da tabela
  public static snakeCaseAttributes = true // Habilita mapeamento automático para snake_case

  // Configuração para mapear camelCase para snake_case
  public static $columnsDefinition = {
    documentoOriginalId: { columnName: 'id_documento_original' },
    dataCriacao: { columnName: 'data_criacao' },
    dataVencimento: { columnName: 'data_vencimento' },
    dataEmissao: { columnName: 'data_emissao' },
    dataPagamento: { columnName: 'data_pagamento' },
    tipoDocumentoId: { columnName: 'id_tipo_documento' },
    nomeDocumentoId: { columnName: 'id_nome_documento' },
    clienteId: { columnName: 'id_cliente' },
    empresaId: { columnName: 'id_empresa' },
    estabelecimentoId: { columnName: 'id_estabelecimento' },
    modeloId: { columnName: 'id_modelo' },
    moedaId: { columnName: 'moeda' },
    descontoGlobal: { columnName: 'desconto_global' },
    grossTotal: { columnName: 'gross_total' },
    hashControl: { columnName: 'hash_control' },
    hash: { columnName: 'hash' },
    meioPagamento: { columnName: 'meio_pagamento' },
    carregamento_data: { columnName: 'carregamento_data' },
    carregamento_hora: { columnName: 'carregamento_hora' },
    carregamento_local: { columnName: 'carregamento_local' },
    descarga_data: { columnName: 'descarga_data' },
    descarga_hora: { columnName: 'descarga_hora' },
    descarga_local: { columnName: 'descarga_local' },
    userId: { columnName: 'user_id' },
    totalFinal: { columnName: 'total_final' },
    motivoEmissao: { columnName: 'motivo_emissao' },
    valorPorPagar: { columnName: 'valor_por_pagar' },
    valorLiquidado: { columnName: 'valor_liquidado' },
    valorPendente: { columnName: 'valor_pendente' },
    sigla: { columnName: 'sigla' },
    created_at_local: { columnName: 'created_at_local' }, 
  }
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare numero: string

  @column({ columnName: 'data_criacao' })
  declare dataCriacao: DateTime

  @column({ columnName: 'data_vencimento' })
  declare dataVencimento: DateTime

  @column()
  declare estado: string
  @column({ columnName: 'motivo_emissao' })

  declare motivoEmissao: string | null

  @column({ columnName: 'data_emissao' })
  declare dataEmissao: DateTime

  @column({ columnName: 'data_pagamento' })
  declare dataPagamento: DateTime

  @column({ columnName: 'meio_pagamento' })
  declare meioPagamento: string | null

  @column()
  declare total: number

  @column()
  declare desconto: number

  @column()
  declare totalFinal: number

  @column()
  declare observacoes: string | null

  @column({ columnName: 'id_tipo_documento' })
  declare tipoDocumentoId: number

  @column({ columnName: 'id_nome_documento' })
  declare nomeDocumentoId: number

  @column({ columnName: 'id_cliente' })
  declare clienteId: number | null

  @column({ columnName: 'id_empresa' })
  declare empresaId: number | null

  @column({ columnName: 'id_estabelecimento' })
  declare estabelecimentoId: number

  @column({ columnName: 'id_modelo' })
  declare modeloId: number

  @column()
  declare termos_condicoes: string | null

  @column({ columnName: 'desconto_global' })
  declare descontoGlobal: number

  @column({ columnName: 'moeda' })
  declare moedaId: number

  @column()
  declare hash: string | null

  @column({ columnName: 'sigla' })
  declare sigla: string

  @column({ columnName: 'carregamento_data' })
  declare carregamentoData: string | null

  @column({ columnName: 'carregamento_hora' })
  declare carregamentoHora: string | null

  @column({ columnName: 'carregamento_local' })
  declare carregamentoLocal: string | null

  @column({ columnName: 'descarga_data' })
  declare descargaData: string | null

  @column({ columnName: 'descarga_hora' })
  declare descargaHora: string | null

  @column({ columnName: 'descarga_local' })
  declare descargaLocal: string | null

  @column({ columnName: 'referencia' })
  declare referencia: string | null

  @column({ columnName: 'hash_control' })
  declare hashControl: string | null

  @column({ columnName: 'gross_total' })
  declare grossTotal: number

  @column({ columnName: 'desconto_global_percentual' })
  declare descontoGlobalPercentual: number

  @column({ columnName: 'desconto_global_valor' })
  declare descontoGlobalValor: number

  @column({ columnName: 'valor_por_pagar' })
  declare valorPorPagar: number

  @column({ columnName: 'valor_liquidado' })
  declare valorLiquidado: number

  @column({ columnName: 'valor_pendente' })
  declare valorPendente: number

  @column({ columnName: 'user_id' })
  declare userId: number

  @column({ columnName: 'id_documento_original' })
  declare documentoOriginalId: number

  @column({ columnName: 'created_at_local' })
  declare createdAtLocal: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => TipoDocumento)
  declare tipoDocumento: BelongsTo<typeof TipoDocumento>

  @belongsTo(() => NomeDocumento)
  declare nomeDocumento: BelongsTo<typeof NomeDocumento>

  @belongsTo(() => Cliente)
  declare cliente: BelongsTo<typeof Cliente>

  @belongsTo(() => Moeda)
  declare moeda: BelongsTo<typeof Moeda>

  @belongsTo(() => Documento)
  declare documentoOriginal: BelongsTo<typeof Documento>

  @hasMany(() => DocumentoItem)
  declare itens: HasMany<typeof DocumentoItem>

  @hasOne(() => Documento, {
    foreignKey: 'documentoOriginalId'
  })
  declare relacionada: HasOne<typeof Documento> 






  @beforeCreate()
  public static async validarDataDocumento(documento: Documento) {
    try {
      // 1️⃣ Verifica se a data de criação está presente
      if (!documento.dataCriacao) {
        return
      }
  
      // 2️⃣ Garante que 'dataCriacao' é um objeto DateTime válido
      const dataCriacao = DateTime.isDateTime(documento.dataCriacao)
        ? documento.dataCriacao
        : DateTime.fromJSDate(new Date(documento.dataCriacao))
  
      // 3️⃣ Busca o documento mais recente do mesmo tipo e empresa
      const ultimoDocumento = await Documento.query()
      .where('id_tipo_documento', documento.tipoDocumentoId)
      .where('id_nome_documento', documento.nomeDocumentoId)
      .where('id_empresa', documento.empresaId || 1)
      .orderBy('data_criacao', 'desc')
      .first()
  
      // 4️⃣ Se existir um documento anterior, valida as datas
      if (ultimoDocumento && ultimoDocumento.dataCriacao) {
        const ultimaDataCriacao = DateTime.isDateTime(ultimoDocumento.dataCriacao)
          ? ultimoDocumento.dataCriacao
          : DateTime.fromJSDate(new Date(ultimoDocumento.dataCriacao))
  
        // Converte ambas as datas em timestamps para comparação precisa
        const dataEmissaoNova = dataCriacao.toMillis()
        const dataEmissaoUltima = ultimaDataCriacao.toMillis()
  
        // 5️⃣ Se a nova data for anterior à última, lança erro
        if (dataEmissaoNova < dataEmissaoUltima) {
          throw new Error(
            `A data de criação (${dataCriacao.toFormat('dd/MM/yyyy')}) não pode ser anterior à data do último documento deste tipo (${ultimaDataCriacao.toFormat('dd/MM/yyyy')}).`
          )
        }
      }
    } catch (error) {
      console.error('❌ Erro ao validar data do documento:', error)
      throw error // Re-lança o erro para impedir a criação do documento
    }
  } 
  
  @beforeCreate()
  public static async gerarReferencia(documento: Documento) {
    try {
      const anoAtual = DateTime.now().toFormat('yyyy')
      const tipoDoc = await NomeDocumento.findOrFail(documento.nomeDocumentoId)
      const prefixo = tipoDoc.abreviacao || 'DOC' // Make sure to use the correct field
      const prefixoCompleto = `${prefixo} TATU${anoAtual}/`

      const ultimoDoc = await Documento.query()
        .where('id_empresa', documento.empresaId || 1)
        .where('id_tipo_documento', documento.tipoDocumentoId)
        .where('id_nome_documento', documento.nomeDocumentoId)
        .where('referencia', 'like', `%TATU${anoAtual}%`)
        .orderBy('id', 'desc')
        .first()

      let proximoNumero = 1
      if (ultimoDoc?.referencia) {
        const match = ultimoDoc.referencia.match(/\/(\d+)$/)
        if (match) {
          proximoNumero = parseInt(match[1], 10) + 1
        }
      }

      documento.referencia = `${prefixoCompleto}${proximoNumero.toString().padStart(2, '0')}`
    } catch (error) {
      console.error('Error generating reference:', error)
      throw error // Re-throw to prevent document creation
    }
  }

  @beforeCreate()
  public static async gerarReferenciaEDigitalSignature(documento: Documento) {
    await this.gerarReferencia(documento)
    await this.generateDigitalSignature(documento)
  }

  public static async generateDigitalSignature(documento: Documento) {
    try {
      const privateKeyPath = app.makePath('public/private.pem')
      console.log('🔑 A carregar chave privada:', privateKeyPath)

      const privateKey = readFileSync(privateKeyPath, { encoding: 'utf-8' }).trim()

      console.log('📆 Obtendo data atual...')
      const now = DateTime.now()
      console.log('📆 Data utilizada na assinatura:', now.toString())

      const sign = createSign('sha1')
      sign.update(documento.referencia || '')
      sign.update(String(documento.total || 0))
      sign.update(now.toISO() || '')

      // Gera a assinatura digital (hash longo)
      const signature = await this.signWithRetry(sign, privateKey)
      documento.hash = signature
      console.log('✅ Assinatura digital criada com sucesso:', signature.slice(0, 20) + '...')

      // Gera o hash de controle (código curto)
      const hashControl = await this.generateHashControl(documento, privateKey)
      documento.numero = hashControl
      console.log('✅ Hash control gerado:', hashControl)
      return {
        grossTotal: documento.grossTotal,
        numero: documento.referencia,      // Ex: "PP TATU2025/01"
        hash: signature,                   // Assinatura digital longa
        hashControl: hashControl           // Código curto
      }
    } catch (error) {
      console.error('❌ Erro ao gerar assinatura digital:', error)
      throw new Error(`Falha na assinatura digital: ${error.message}`)
    }
  }
  private static async signWithRetry(sign: any, privateKey: string): Promise<string> {
    return retry<string>(
      async () => {
        try {
          // Try different key formats and types
          const keyFormats = [
            { format: 'pem', type: 'pkcs8' },
            { format: 'pem', type: 'pkcs1' },
            { format: 'der', type: 'pkcs8' },
            { format: 'der', type: 'pkcs1' }
          ];

          for (const keyFormat of keyFormats) {
            try {
              console.log(`Tentando assinar com formato: ${keyFormat.format}, tipo: ${keyFormat.type}`);
              const signature = sign.sign(
                {
                  key: privateKey,
                  format: keyFormat.format,
                  type: keyFormat.type,
                  // Add passphrase if the key is encrypted
                  passphrase: '011998' // Descomente e adicione a senha se necessário
                },
                'base64'
              );
              console.log(`✅ Assinatura criada com sucesso (${keyFormat.format} ${keyFormat.type})`);
              return signature;
            } catch (formatError) {
              console.warn(`⚠️ Falha com ${keyFormat.format} ${keyFormat.type}:`, formatError.message);
              // Continue to the next format
            }
          }

          // If we get here, all formats failed
          throw new Error('Todas as tentativas de formato de chave falharam');

        } catch (error) {
          console.error('❌ Erro ao assinar:', {
            message: error.message,
            stack: error.stack,
            opensslErrorStack: error.opensslErrorStack
          });
          throw error;
        }
      },
      { retries: 3, minTimeout: 1000, maxTimeout: 4000 }
    );
  }


  private static async findLastDocumentWithRetry(documento: Documento): Promise<Documento | null> {
    try {
      return await retry<Documento | null>(
        async () => {
          return await Documento.query()
            .where('id_empresa', documento.empresaId || 1)
            .where('id_nome_documento', documento.nomeDocumentoId || 1)
            .where('id_tipo_documento', documento.tipoDocumentoId || 1)
            .orderBy('id', 'desc')
            .first()
        },
        { retries: 3, minTimeout: 1000, maxTimeout: 4000 }
      )
    } catch (error) {
      console.error('Error in findLastDocumentWithRetry:', error)
      return null
    }
  }

  private static async generateHashControl(documento: Documento, privateKey: string): Promise<string> {
    try {
      console.log(' A gerar hash de controlo...')

      // Ensure we have a valid DateTime object
      let dataCriacao: DateTime;

      if (DateTime.isDateTime(documento.dataCriacao)) {
        dataCriacao = documento.dataCriacao;
      } else if (documento.dataCriacao && typeof documento.dataCriacao === 'object' && 'toISOString' in documento.dataCriacao) {
        // This handles both Date objects and any other object with toISOString method
        dataCriacao = DateTime.fromJSDate(documento.dataCriacao as unknown as Date);
      } else if (typeof documento.dataCriacao === 'string') {
        dataCriacao = DateTime.fromISO(documento.dataCriacao);
      } else {
        dataCriacao = DateTime.now();
      }

      const invoiceDate = dataCriacao.toFormat('yyyy-MM-dd')
      // Include time in the system date
      const systemDate = DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss")
      const documentNumber = documento.referencia || ''
      const grossTotal = documento.grossTotal || 0
      const lastDoc = await this.findLastDocumentWithRetry(documento);
      const lastHash = lastDoc?.hash || '';

      const hashControlString = `${invoiceDate};${systemDate};${documentNumber};${grossTotal};${lastHash}`
      console.log('📄 String do hash control:', hashControlString)

      const signControl = createSign('sha1')
      signControl.update(hashControlString)
      const signature = await this.signWithRetry(signControl, privateKey)

      documento.hashControl = hashControlString
      const hash64 = Buffer.from(signature).toString('base64')
      let hash4 = ''
      for (let i = 0; i <= 30 && i < hash64.length; i += 10) {
        hash4 += hash64[i] || ''
      }

      return hash4
    } catch (error) {
      console.error('Error generating hash control:', error)
      throw error
    }
  }

}
