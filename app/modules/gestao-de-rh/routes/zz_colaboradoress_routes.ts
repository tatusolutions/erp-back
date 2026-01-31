import ColaboradoresController from '../controllers/colaboradores_controller.js'
import { middleware } from '#start/kernel'

const controller = new ColaboradoresController()

export default function (Route: any) {
  Route.group(() => {
    Route.get('/', controller.index.bind(controller))
    Route.get('/list', controller.list.bind(controller))
    Route.post('/', controller.store.bind(controller))
    Route.get('/:id', controller.show.bind(controller))
    Route.get('/:id/empresa', controller.getEmpresa.bind(controller))
    Route.put('/:id', controller.update.bind(controller))
    Route.delete('/:id', controller.destroy.bind(controller))
    Route.get('/:id/tem-folha', controller.temFolha.bind(controller))
    Route.put('/:id/desvincular', controller.desvincular.bind(controller))
    Route.put('/:id/suspender', controller.suspender.bind(controller))
    Route.put('/:id/ativar', controller.ativar.bind(controller))
  }).prefix('/colaboradores')
   // .use([middleware.auth()]) // Temporariamente desativado para teste
}
