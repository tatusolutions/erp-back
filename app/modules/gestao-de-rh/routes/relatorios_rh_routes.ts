import router from '@adonisjs/core/services/router'
import RelatoriosRhController from '../controllers/relatorios_rh_controller.js'

const controller = new RelatoriosRhController()

export default function (Route: any) {
  Route.group(() => {
    router.post('/gerar', controller.gerar.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.get('/dados-seguranca-social', controller.getDadosSegurancaSocial.bind(controller))
    router.get('/dados-irt-modelo-2', controller.getDadosIrtModelo2.bind(controller))
    router.get('/dados-irt-mapa-mensal', controller.getDadosIrtMapaMensal.bind(controller))
    router.get('/dados-modelo-psx', controller.getDadosModeloPsx.bind(controller))
    router.get('/dados-irt-grupo-b', controller.getDadosIrtGrupoB.bind(controller))
    router.get('/baixar/:id', controller.baixar.bind(controller))
    router.delete('/:id', controller.excluir.bind(controller))
    router.get('/:id', controller.show.bind(controller))
  }).prefix('/relatorios_rh')
}
