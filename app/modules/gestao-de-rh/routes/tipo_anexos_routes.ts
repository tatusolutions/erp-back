import TipoAnexosController from '../controllers/tipo_anexos_controller.js'
import { middleware } from '#start/kernel'

const controller = new TipoAnexosController()

export default function (Route: any) {
  Route.group(() => {
    Route.get('/', controller.index.bind(controller))
    Route.get('/list', controller.list.bind(controller))
    Route.post('/', controller.store.bind(controller))
    Route.get('/:id', controller.show.bind(controller))
    Route.put('/:id', controller.update.bind(controller))
    Route.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/tipo-anexos')
   // .use([middleware.auth()]) // Temporariamente desativado para teste
}
