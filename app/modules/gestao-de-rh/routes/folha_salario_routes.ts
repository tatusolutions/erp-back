import router from '@adonisjs/core/services/router'
import FolhaSalarioController from '../controllers/folha_salario_controller.js'

const controller = new FolhaSalarioController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/totais', controller.calcularTotais.bind(controller))
    router.get('/anos-com-folha', controller.anosComFolha.bind(controller))
    router.get('/meses-com-folha', controller.mesesComFolha.bind(controller))
    router.get('/disponiveis/:ano', controller.getFolhasDisponiveis.bind(controller))
    router.get('/verificar-subsidio-natal/:ano', controller.verificarSubsidioNatalAplicado.bind(controller))
    router.get('/verificar-subsidio-natal/:ano/:mes', controller.verificarSubsidioNatalAplicado.bind(controller))
    router.get('/resumido/:ano/:mes', controller.resumido.bind(controller))
    router.get('/colaborador/:id_colaborador/mes/:mes/ano/:ano', controller.findByColaboradorMesAno.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.post('/gerar', controller.gerarFolha.bind(controller))
    router.post('/processar', controller.processar.bind(controller))
    router.post('/calcular', controller.calcular.bind(controller))
    router.post('/aplicar-subsidio-natal', controller.aplicarSubsidioNatal.bind(controller))
    router.post('/remover-subsidio-natal', controller.removerSubsidioNatal.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.delete.bind(controller))
  }).prefix('/folha_salario')
  // .use([middleware.auth()]) // Temporariamente desativado para teste
}
