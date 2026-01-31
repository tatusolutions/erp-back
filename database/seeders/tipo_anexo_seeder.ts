import { BaseSeeder } from '@adonisjs/lucid/seeders'
import TipoAnexo from '../../app/modules/gestao-de-rh/models/TipoAnexo.js'

export default class TipoAnexoSeeder extends BaseSeeder {
  async run() {
    const tiposAnexos = [
      {
        nome: 'Bilhete de Identidade',
        abreviacao: 'BI',
        descricao: 'Documento de identificação civil'
      },
      {
        nome: 'Carta de Condução',
        abreviacao: 'CC',
        descricao: 'Licença de condução de veículos'
      },
      {
        nome: 'Passaporte',
        abreviacao: 'PPT',
        descricao: 'Documento de viagem internacional'
      },
      {
        nome: 'Certificado de Habilitações',
        abreviacao: 'CH',
        descricao: 'Certificado de conclusão de estudos'
      },
      {
        nome: 'Contrato de Trabalho',
        abreviacao: 'CT',
        descricao: 'Acordo de trabalho entre colaborador e empresa'
      },
      {
        nome: 'Declaração de IRS',
        abreviacao: 'IRS',
        descricao: 'Declaração de rendimentos para fins fiscais'
      },
      {
        nome: 'Seguro de Saúde',
        abreviacao: 'SS',
        descricao: 'Apólice de seguro de saúde'
      },
      {
        nome: 'Exame Médico',
        abreviacao: 'EM',
        descricao: 'Relatório de exame médico admissional'
      },
      {
        nome: 'Certificado de Residência',
        abreviacao: 'CR',
        descricao: 'Comprovante de residência'
      },
      {
        nome: 'Ficha Criminal',
        abreviacao: 'FC',
        descricao: 'Registo criminal do colaborador'
      },
      {
        nome: 'Cartão de Contribuinte',
        abreviacao: 'NIF',
        descricao: 'Número de identificação fiscal'
      },
      {
        nome: 'Cartão de Segurança Social',
        abreviacao: 'NISS',
        descricao: 'Número de inscrição na segurança social'
      },
      {
        nome: 'Certificado de Formação',
        abreviacao: 'CF',
        descricao: 'Certificados de cursos e formações profissionais'
      },
      {
        nome: 'Declaração de Vencimento',
        abreviacao: 'DV',
        descricao: 'Declaração de vencimentos para fins diversos'
      },
      {
        nome: 'Autorização de Residência',
        abreviacao: 'AR',
        descricao: 'Autorização de residência para cidadãos estrangeiros'
      }
    ]

    // Limpar dados existentes (opcional)
    await TipoAnexo.query().delete()

    // Inserir novos dados
    for (const tipoAnexo of tiposAnexos) {
      await TipoAnexo.create(tipoAnexo)
    }

    console.log('✅ TipoAnexoSeeder executado com sucesso!')
    console.log(`📝 ${tiposAnexos.length} tipos de anexos criados`)
  }
}
