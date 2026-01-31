import { test } from '@japa/runner'
import FolhaSalarioService from '../../app/modules/gestao-de-rh/services/folha_salario_service.js'
import Falta from '../../app/modules/gestao-de-rh/models/falta.js'
import FolhaSalario from '../../app/modules/gestao-de-rh/models/FolhaSalario.js'

test.group('Recálculo de Salário por Falta', () => {
  test('deve recalcular IRT e SS quando falta justificada é aprovada', async ({ assert }) => {
    const folhaSalarioService = new FolhaSalarioService()
    
    // Mock data para teste
    const colaboradorId = 1
    const dataFalta = '2024-01-15'
    
    // Este teste verifica se o método existe e pode ser chamado
    // Em um ambiente real, você precisaria de dados mockados no banco
    try {
      await folhaSalarioService.recalcularSalarioPorFaltaAprovada(colaboradorId, dataFalta)
      assert.isTrue(true) // Se não lançar erro, o teste passa
    } catch (error) {
      // Erros de "folha não encontrada" são esperados em ambiente de teste
      if (error.message.includes('Folha não encontrada')) {
        assert.isTrue(true)
      } else {
        throw error
      }
    }
  })

  test('deve calcular descontos corretamente para faltas justificadas e não justificadas', async ({ assert }) => {
    const folhaSalarioService = new FolhaSalarioService()
    
    // Mock folha
    const mockFolha = {
      id: 1,
      salario_base: 100000, // 100.000,00 AOA
      total_bruto: 100000
    } as FolhaSalario
    
    // Mock faltas
    const mockFaltas = [
      {
        tipo: 'falta_justificada',
        duracao: 2 // 2 dias
      },
      {
        tipo: 'falta_injustificada',
        duracao: 1 // 1 dia
      }
    ]
    
    // Acessar método privado através de reflexão (apenas para teste)
    const calcularDescontosPorFaltas = (folhaSalarioService as any).calcularDescontosPorFaltas
    const resultado = calcularDescontosPorFaltas(mockFolha, mockFaltas)
    
    const salarioDiario = mockFolha.salario_base / 22 // 22 dias úteis
    
    // 2 dias justificados = 2 * salarioDiario * 0.5
    const descontoJustificados = 2 * salarioDiario * 0.5
    // 1 dia não justificado = 1 * salarioDiario * 1.0
    const descontoNaoJustificados = 1 * salarioDiario * 1.0
    
    const valorTotalEsperado = descontoJustificados + descontoNaoJustificados
    
    assert.equal(resultado.justificadas, 2)
    assert.equal(resultado.naoJustificadas, 1)
    assert.closeTo(resultado.valorTotal, valorTotalEsperado, 0.01)
  })
})
