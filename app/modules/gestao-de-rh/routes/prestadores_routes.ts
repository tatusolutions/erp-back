import { middleware } from '#start/kernel'
import PrestadoresController from '../controllers/prestadores_controller.js'

const controller = new PrestadoresController()

export default function (Route: any) {
  Route.group(() => {
    Route.get('/', controller.index.bind(controller))
    Route.get('/list', controller.list.bind(controller))
    Route.post('/', controller.store.bind(controller))
    Route.get('/:id', controller.show.bind(controller))
    Route.put('/:id', controller.update.bind(controller))
    Route.delete('/:id', controller.destroy.bind(controller))
    Route.get('/:id/historico-pagamentos', controller.getHistoricoPagamentos.bind(controller))
    Route.get('/:id/verificar-pagamento/:ano/:mes', controller.verificarPagamentoExistente.bind(controller))
    Route.post('/:id/registrar-pagamento', controller.registrarPagamento.bind(controller))
    Route.put('/pagamentos/:id/anular', controller.anularPagamento.bind(controller))
  })
    .prefix('/prestadores')
    .use([middleware.auth()])
}