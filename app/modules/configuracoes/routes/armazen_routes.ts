import router from '@adonisjs/core/services/router'
import ArmazenController from '../controllers/armazen_controller.js'
import { middleware } from '#start/kernel'

const controller = new ArmazenController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.get('/proxima-serie', controller.proximaSerie.bind(controller))
    router.get('/verificar-serie', controller.verificarSerie.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/armazen')
  .use([middleware.auth()])
}
