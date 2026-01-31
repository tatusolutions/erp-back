import router from '@adonisjs/core/services/router'
import FaltasController from '../controllers/faltas_controller.js'

const controller = new FaltasController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.get('/estatisticas', controller.estatisticas.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
    router.post('/:id/aprovar', controller.aprovar.bind(controller))
    router.post('/:id/rejeitar', controller.rejeitar.bind(controller))
    router.delete('/colaborador/:colaboradorId/mes/:mes/ano/:ano', controller.eliminarPorColaboradorMesAno.bind(controller))
    router.delete('/mes/:mes/ano/:ano', controller.eliminarPorMesAno.bind(controller))
  }).prefix('/faltas')
 // .use([middleware.auth()]) // Temporariamente desativado para teste
}
