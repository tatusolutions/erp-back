import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Estagiarios extends BaseSchema {
  protected tableName = 'estagiarios'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      /* ===== Chaves estrangeiras ===== */
      table
        .integer('id_empresa')
        .unsigned()
        .references('id')
        .inTable('empresas')
        .onDelete('SET NULL')

      table
        .integer('id_departamento')
        .unsigned()
        .references('id')
        .inTable('departamentos')
        .onDelete('SET NULL')

      table
        .integer('id_supervisor')
        .unsigned()
        .references('id')
        .inTable('colaboradores')
        .onDelete('SET NULL')

      table
        .integer('id_projeto')
        .unsigned()
        .references('id')
        .inTable('projetos')
        .onDelete('SET NULL')

      table
        .integer('user_id')
        .unsigned()
        .references('id')
        .inTable('users')
        .onDelete('SET NULL')

      /* ===== Dados pessoais ===== */
      table.string('foto').nullable()
      table.string('nome', 150).notNullable()
      table.string('bi', 30).notNullable().unique()
      table.date('data_bi_validade').nullable()
      table.date('data_nascimento').notNullable()
      table.string('sexo', 20).notNullable()
      table.string('estado_civil', 30).notNullable()
      table.string('nacionalidade', 100).notNullable()
      table.string('endereco', 255).notNullable()
      table.string('telefone_principal', 20).notNullable()
      table.string('telefone_alternativo', 20).nullable()
      table.string('email', 150).nullable()
      table.string('email_institucional', 150).nullable()
      table.string('nss', 50).nullable()
      table.boolean('adicionar_remuneracao').defaultTo(false)

      /* ===== Dados acadêmicos ===== */
      table.string('nivel_academico', 50).notNullable()
      table.string('curso', 150).notNullable()
      table.string('instituicao_ensino', 150).notNullable()

      /* ===== Dados do estágio ===== */
      table.date('data_inicio_estagio').notNullable()
      table.date('data_fim_estagio').nullable()
      table.string('tipo_estagio', 50).notNullable()
      table.string('status_estagio', 30).notNullable().defaultTo('pendente')

      /* ===== Financeiro ===== */
      table.decimal('bolsa_auxilio', 15, 2).nullable()
      table.decimal('auxilio_transporte', 15, 2).nullable()
      table.decimal('auxilio_alimentacao', 15, 2).nullable()

      /* ===== Avaliação ===== */
      table.text('plano_atividades').nullable()
      table.text('avaliacao_desempenho').nullable()
      table.text('relatorio_final').nullable()

      /* ===== Certificação ===== */
      table.boolean('certificado_emitido').defaultTo(false)
      table.date('data_emissao_certificado').nullable()

      /* ===== Documentação ===== */
      table.string('declaracao_vinculo', 255).nullable()
      table.string('termo_compromisso', 255).nullable()
      table.string('plano_estagio_arquivo', 255).nullable()
      table.string('relatorio_arquivo', 255).nullable()
      table.string('certificado_arquivo', 255).nullable()

      /* ===== Observações ===== */
      table.text('observacoes').nullable()
      table.string('status', 30).notNullable().defaultTo('ativo')

      /* ===== Timestamps ===== */
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
