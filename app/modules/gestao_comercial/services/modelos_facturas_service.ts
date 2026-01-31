import ModelosFactura from '../models/ModelosFactura.js'
import { Exception } from '@adonisjs/core/exceptions'

export default class ModelosFacturaService {
  async listAll(page: number = 1, limit: number = 10) {
    return await ModelosFactura.query().preload('bancos').paginate(page, limit)
  }

  async list() {
    return await ModelosFactura.all()
  }

  async findById(id: number) {
    const modelo = await ModelosFactura.query()
      .where('id', id)
      .preload('bancos', (query) => {
        query.pivotColumns(['iban', 'n_conta'])
      })
      .firstOrFail()
  
    return modelo
  }
  

  async create(data: any) {
    try {
      console.log('Dados recebidos no serviço:', JSON.stringify(data, null, 2))

      const { bancos, ...modeloData } = data

      // Validação básica dos campos obrigatórios
      if (!modeloData.nif || !modeloData.nome) {
        throw new Exception('NIF e Nome são campos obrigatórios', { status: 422 })
      }

      // Verifica se já existe um modelo com o mesmo NIF
      const modeloExistente = await ModelosFactura.query()
        .where('nif', modeloData.nif)
        .first()

      if (modeloExistente) {
        throw new Exception('Já existe um modelo de fatura com este NIF.', { status: 409 })
      }

      // Cria o modelo de fatura
      const modeloFactura = await ModelosFactura.create(modeloData)

      // Associa os bancos, se houver
      if (bancos && Array.isArray(bancos) && bancos.length > 0) {
        const bancosPivot = bancos.reduce((acc, banco) => {
          if (banco.id) {
            acc[banco.id] = {
              iban: banco.iban || '',
              n_conta: banco.n_conta || '',
              abreviacao: banco.abreviacao || ''
            }
          }
          return acc
        }, {} as Record<number, { iban: string; n_conta: string; abreviacao: string }>)

        if (Object.keys(bancosPivot).length > 0) {
          await modeloFactura.related('bancos').attach(bancosPivot)
        }
      }

      // Recarrega o modelo com os relacionamentos
      await modeloFactura.load('bancos')

      return modeloFactura
    } catch (error) {
      console.error('Erro ao criar modelo de fatura:', error)
      throw error // Rejoga o erro para ser tratado pelo controller
    }
  }

  async update(id: number, data: Partial<ModelosFactura>) {
    const trx = await ModelosFactura.transaction()

    try {
      const modelo = await ModelosFactura.findOrFail(id, { client: trx })
      const { bancos, ...modeloData } = data

      // Atualiza os dados do modelo
      await modelo.merge(modeloData).save()

      // Sincroniza os bancos
      if (bancos && Array.isArray(bancos)) {
        // In classrooms_service.ts, update the bancosPivot code:
        const bancosPivot = bancos.reduce((acc, banco: { id?: number } & { iban?: string; n_conta?: string; abreviacao?: string }) => {
          if (banco.id) {
            acc[banco.id] = {
              iban: banco.iban || '',
              n_conta: banco.n_conta || '',
              abreviacao: banco.abreviacao || ''
            }
          }
          return acc
        }, {} as Record<number, { iban: string; n_conta: string; abreviacao: string }>)

        await modelo.related('bancos').sync(bancosPivot)
      }

      return await modelo.load('bancos')
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  async delete(id: number) {
    const modelo = await ModelosFactura.findOrFail(id)
    await modelo.delete()
    return true
  }

  // Cria um novo modelo de fatura
  async criarModeloFactura(data: any) {
    const { client, ...modeloData } = data;
    const options = client ? { client } : undefined;
    return await ModelosFactura.create(modeloData, options);
  }

  // Sincroniza os bancos de um modelo de fatura
  async sincronizarBancos(modeloFacturaId: number, bancos: any[], trx?: any) {
    const options = trx ? { client: trx } : undefined;
    const modelo = await ModelosFactura.findOrFail(modeloFacturaId, options);

    const bancosPivot = bancos.reduce((acc, banco) => {
      if (banco.id) {
        acc[banco.id] = {
          iban: banco.iban || '',
          n_conta: banco.n_conta || '',
          abreviacao: banco.abreviacao || ''
        };
      }
      return acc;
    }, {} as Record<number, { iban: string; n_conta: string; abreviacao: string }>);

    await modelo.related('bancos').sync(bancosPivot);
    await modelo.load('bancos');
    return modelo;
  }

  // Obtém um modelo de fatura por ID
  async obterModeloPorId(id: number) {
    return await this.findById(id);
  }

  // Atualiza um modelo de fatura
  async atualizarModelo(id: number, data: any) {
    const { client, ...modeloData } = data;
    const options = client ? { client } : undefined;

    const modelo = await ModelosFactura.findOrFail(id, options);
    await modelo.merge(modeloData).save();

    if (data.bancos && Array.isArray(data.bancos)) {
      await this.sincronizarBancos(id, data.bancos, client);
    }

    return modelo;
  }

  // Remove um modelo de fatura
  async removerModelo(id: number) {
    return await this.delete(id);
  }

  // Lista os bancos de um modelo
  async listarBancosDoModelo(modeloFacturaId: number) {
    const modelo = await ModelosFactura.query()
      .where('id', modeloFacturaId)
      .preload('bancos', (query) => {
        query.pivotColumns(['iban', 'n_conta', 'abreviacao']);
      })
      .firstOrFail();
    
    return modelo.bancos.map(banco => {
      return {
        ...banco.toJSON(),
        iban: banco.$extras.pivot_iban,
        n_conta: banco.$extras.pivot_n_conta,
        abreviacao: banco.$extras.pivot_abreviacao
      };
    });
  }

  // Adiciona um banco a um modelo
  async adicionarBanco(modeloFacturaId: number, bancoData: any) {
    const modelo = await ModelosFactura.findOrFail(modeloFacturaId);

    if (!bancoData.id) {
      throw new Error('ID do banco é obrigatório');
    }

    await modelo.related('bancos').attach({
      [bancoData.id]: {
        iban: bancoData.iban || '',
        n_conta: bancoData.n_conta || '',
        abreviacao: bancoData.abreviacao || ''
      }
    });

    await modelo.load('bancos');
    return modelo;
  }

  // Atualiza um banco de um modelo
  async atualizarBanco(modeloFacturaId: number, bancoId: number, bancoData: any) {
    const modelo = await ModelosFactura.findOrFail(modeloFacturaId);

    // Primeiro verifica se o banco existe no modelo
    const bancosAtuais = await modelo.related('bancos').pivotQuery()
      .where('banco_id', bancoId)
      .first();

    if (!bancosAtuais) {
      throw new Error('Banco não encontrado neste modelo');
    }

    // Atualiza os dados do banco
    await modelo.related('bancos').pivotQuery()
      .where('banco_id', bancoId)
      .update({
        iban: bancoData.iban || '',
        n_conta: bancoData.n_conta || '',
        abreviacao: bancoData.abreviacao || ''
      });

    await modelo.load('bancos');
    return modelo;
  }

  // Remove um banco de um modelo
  async removerBanco(modeloFacturaId: number, bancoId: number) {
    const modelo = await ModelosFactura.findOrFail(modeloFacturaId);
    await modelo.related('bancos').detach([bancoId]);
    return true;
  }
}