import { BaseSchema } from '@adonisjs/lucid/schema'

export default class CreateFolhaSalarioTable extends BaseSchema {
  protected tableName = 'folha_salario'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      
      table.integer('id_colaborador').unsigned().references('id').inTable('colaboradores').onDelete('CASCADE')
      table.string('nome_funcionario', 255)
      table.integer('ano').notNullable()
      table.integer('mes').notNullable()
      
      // Remuneração
      table.decimal('salario_base', 10, 2).nullable()
      table.decimal('total_subsidios', 10, 2).nullable()
      table.decimal('total_bruto', 10, 2).nullable()
      table.decimal('horas_extras', 10, 2).nullable()
      table.decimal('bonus', 10, 2).nullable()
      table.decimal('premios', 10, 2).nullable()
      table.decimal('outros_subsidios', 10, 2).nullable()
      table.boolean('adicionar_remuneracao').defaultTo(false)
      
      // Subsídios
      table.decimal('subsidio_alimentacao', 10, 2).nullable()
      table.decimal('subsidio_transporte', 10, 2).nullable()
      table.decimal('subsidio_noturno', 10, 2).nullable()
      table.decimal('subsidio_de_turno', 10, 2).nullable()
      table.decimal('subsidio_de_risco', 10, 2).nullable()
      table.decimal('subsidio_de_representacao', 10, 2).nullable()
      table.decimal('subsidio_de_regencia', 10, 2).nullable()
      table.decimal('subsidio_de_renda', 10, 2).nullable()
      table.decimal('subsidio_de_disponibilidade', 10, 2).nullable()
      table.decimal('subsidio_de_exame', 10, 2).nullable()
      table.decimal('subsidio_de_atavio', 10, 2).nullable()
      table.decimal('subsidio_de_ferias', 10, 2).nullable()
      table.string('subsidio_de_natal', 50).nullable()
      table.decimal('abono_familia', 10, 2).nullable()
      table.decimal('abono_para_falhas', 10, 2).nullable()
      
      // Campos antigos (mantidos para compatibilidade)
      table.decimal('subsidios', 10, 2).defaultTo(0)
      table.decimal('ss', 10, 2).defaultTo(0)
      table.decimal('irt', 10, 2).defaultTo(0)
      table.decimal('outros_descontos', 10, 2).defaultTo(0)
      table.decimal('liquido', 10, 2).defaultTo(0)
      table.decimal('mc_ss', 10, 2).defaultTo(0)
      table.decimal('mc_irt', 10, 2).defaultTo(0)
      table.timestamp('data_referencia').nullable()
      table.string('status', 50).defaultTo('pendente')
      
      table.timestamp('created_at').defaultTo(this.now())
      table.timestamp('updated_at').defaultTo(this.now())
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
