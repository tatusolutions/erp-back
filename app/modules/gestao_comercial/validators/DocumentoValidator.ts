import { schema, rules } from '@ioc:Adonis/Core/Validator'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export class DocumentoValidator {
  constructor(protected ctx: HttpContextContract) {}

  public schema = schema.create({
    data_criacao: schema.date({}, [
      rules.required(),
      rules.beforeOrEqual(this.ctx.request.input('data_vencimento'))
    ]),
    
    data_vencimento: schema.date({}, [
      rules.required(),
      rules.afterOrEqual(this.ctx.request.input('data_criacao'))
    ]),
    
    id_modelo: schema.number([
      rules.required(),
      rules.exists({ table: 'modelos', column: 'id' })
    ]),
    
    id_estabelecimento: schema.number([
      rules.required(),
      rules.exists({ table: 'estabelecimentos', column: 'id' })
    ]),
    
    id_tipo_documento: schema.number([
      rules.required(),
      rules.exists({ table: 'tipo_documentos', column: 'id' })
    ]),
    
    id_nome_documento: schema.number([
      rules.required(),
      rules.exists({ table: 'nome_documentos', column: 'id' })
    ]),
    
    id_cliente: schema.number([
      rules.required(),
      rules.exists({ table: 'clientes', column: 'id' })
    ]),
    
    moeda: schema.string.optional({ trim: true }, [
      rules.maxLength(10)
    ]),
    
    id_empresa: schema.number([
      rules.required(),
      rules.exists({ table: 'empresas', column: 'id' })
    ]),
    
    observacoes: schema.string.optional({ trim: true }, [
      rules.maxLength(1000)
    ]),
    
    termos_condicoes: schema.string.optional({ trim: true }, [
      rules.maxLength(2000)
    ]),
    
    desconto_global: schema.number.optional([
      rules.range(0, 100)
    ]),
    
    estado: schema.string.optional({ trim: true }, [
      rules.maxLength(20),
      rules.in(['rascunho', 'pendente', 'pago', 'cancelado', 'anulado'])
    ]),
    
    serie: schema.string.optional({ trim: true }, [
      rules.maxLength(10)
    ]),
    
    numero: schema.number.optional(),
    
    itens: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        id_produto: schema.number([
          rules.required(),
          rules.exists({ table: 'produtos', column: 'id' })
        ]),
        
        descricao: schema.string({ trim: true }, [
          rules.required(),
          rules.maxLength(500)
        ]),
        
        quantidade: schema.number([
          rules.required(),
          rules.range(0.001, 999999.999)
        ]),
        
        preco_unitario: schema.number([
          rules.required(),
          rules.range(0, 999999999.99)
        ]),
        
        desconto: schema.number.optional([
          rules.range(0, 100)
        ]),
        
        imposto: schema.number.optional([
          rules.range(0, 100)
        ]),
        
        total_iliquido: schema.number.optional([
          rules.range(0, 999999999.99)
        ]),
        
        total_imposto: schema.number.optional([
          rules.range(0, 999999999.99)
        ]),
        
        total_liquido: schema.number.optional([
          rules.range(0, 999999999.99)
        ]),
        
        observacoes: schema.string.optional({ trim: true }, [
          rules.maxLength(500)
        ]),
      })
    )
  })

  public messages = {
    'data_criacao.required': 'A data de criação é obrigatória',
    'data_vencimento.required': 'A data de vencimento é obrigatória',
    'data_vencimento.afterOrEqual': 'A data de vencimento deve ser igual ou posterior à data de criação',
    'data_criacao.beforeOrEqual': 'A data de criação deve ser igual ou anterior à data de vencimento',
    'id_modelo.required': 'O modelo é obrigatório',
    'id_estabelecimento.required': 'O estabelecimento é obrigatório',
    'id_tipo_documento.required': 'O tipo de documento é obrigatório',
    'id_nome_documento.required': 'O nome do documento é obrigatório',
    'id_cliente.required': 'O cliente é obrigatório',
    'id_empresa.required': 'A empresa é obrigatória',
    'itens.required': 'O documento deve conter pelo menos um item',
    'itens.minLength': 'O documento deve conter pelo menos um item'
  }
}
