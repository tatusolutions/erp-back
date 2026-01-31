import { DateTime } from 'luxon'
import Prestador from '../models/Prestador.js'
import PrestadorPagamento from '../models/PrestadorPagamento.js'

export default class PrestadorService {
  async listAll(page: number = 1, limit: number = 10, search: string = '', estado: string = '') {
    const query = Prestador.query()
      .preload('empresa')
      .preload('departamento')
      .preload('profissao')

    if (search) {
      query.whereILike('nome', `%${search}%`)
    }

    if (estado) {
      query.where('estado', estado)
    }

    return await query.paginate(page, limit)
  }

  async list() {
    return await Prestador.query()
      .preload('empresa')
      .preload('departamento')
      .preload('profissao')
      .exec()
  }

  async findById(id: number) {
    return await Prestador.query()
      .where('id', id)
      .preload('empresa')
      .preload('departamento')
      .preload('profissao')
      .firstOrFail()
  }

  async create(data: Partial<Prestador> & { valor_pagamento?: string | number | null }) {
    // Converter valor_pagamento de string formatada para número
    if (data.valor_pagamento != null && typeof data.valor_pagamento === 'string') {
      // Remove formatação e converte para número
      const cleanValue = (data.valor_pagamento as string).replace(/\D/g, '')
      data.valor_pagamento = parseFloat(cleanValue) / 100
    }

    return await Prestador.create(data)
  }

  async update(id: number, data: Partial<Prestador> & { valor_pagamento?: string | number | null }) {
    const prestador = await Prestador.findOrFail(id)

    // Converter valor_pagamento de string formatada para número
    if (data.valor_pagamento != null && typeof data.valor_pagamento === 'string') {
      // Remove formatação e converte para número
      const cleanValue = (data.valor_pagamento as string).replace(/\D/g, '')
      data.valor_pagamento = parseFloat(cleanValue) / 100
    }

    prestador.merge(data)
    await prestador.save()
    return prestador
  }

  async delete(id: number) {
    const prestador = await Prestador.findOrFail(id)
    await prestador.delete()
  }

  async getHistoricoPagamentos(prestadorId: number) {
    return await PrestadorPagamento.query()
      .where('prestador_id', prestadorId)
      .preload('usuario', (query) => {
        query.select('id', 'name')
      })
      .orderBy('ano', 'desc')
      .orderBy('mes', 'desc')
  }

  async verificarPagamentoExistente(prestadorId: number, ano: number, mes: number) {
    return await PrestadorPagamento.query()
      .where('prestador_id', prestadorId)
      .where('ano', ano)
      .where('mes', mes)
      .whereNot('status', 'anulado')
      .first()
  }

  async anularPagamento(pagamentoId: number, motivo: string) {
    const pagamento = await PrestadorPagamento.findOrFail(pagamentoId)

    // Atualiza o status para 'anulado' e adiciona o motivo nas observações
    await pagamento.merge({
      status: 'anulado',
      observacoes: `[ANULADO - ${DateTime.now().toFormat('dd/MM/yyyy HH:mm')}] ${motivo}\n${pagamento.observacoes || ''}`
    }).save()

    return pagamento
  }

  // Em prestador_service.ts

  async verificarPagamentoAtivo(prestadorId: number, ano: number, mes: number) {
    return await PrestadorPagamento.query()
      .where('prestador_id', prestadorId)
      .where('ano', ano)
      .where('mes', mes)
      .whereNot('status', 'anulado')
      .first()
  }

  async registrarPagamento(data: {
    prestador_id: number
    ano: number
    mes: number
    valor: string | number
    data_pagamento?: string
    observacoes?: string
    status?: string
    empresa_id?: number
    usuario_id?: number
  }) {
    // Verifica se já existe um pagamento ativo para o mesmo mês/ano
    const pagamentoAtivo = await PrestadorPagamento.query()
      .where('prestador_id', data.prestador_id)
      .where('ano', data.ano)
      .where('mes', data.mes)
      .whereNot('status', 'anulado')
      .first();

    if (pagamentoAtivo) {
      const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];
      const nomeMes = meses[data.mes - 1]; // meses são 1-12, array é 0-11
      throw new Error(`Já existe um pagamento ativo para ${nomeMes}/${data.ano}`);
    }

    // Converte o valor para número
    const valorNumerico = typeof data.valor === 'string'
      ? parseFloat(data.valor.replace(/\./g, '').replace(',', '.'))
      : data.valor;

    // Define a data de pagamento
    const dataPagamento = data.data_pagamento
      ? DateTime.fromISO(data.data_pagamento)
      : DateTime.now();

    // Cria um novo registro de pagamento
    const pagamento = await PrestadorPagamento.create({
      prestador_id: data.prestador_id,
      ano: data.ano,
      mes: data.mes,
      valor: valorNumerico,
      data_pagamento: dataPagamento,
      observacoes: data.observacoes || null,
      status: data.status || 'pago',
      empresa_id: data.empresa_id,
      usuario_id: data.usuario_id
    });

    // Atualiza a data do último pagamento no prestador
    await Prestador.query()
      .where('id', data.prestador_id)
      .update({ ultimo_pagamento: dataPagamento.toISO() });

    return pagamento;
  }
}
