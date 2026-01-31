import router from '@adonisjs/core/services/router'
import MapaIRTController from '../controllers/mapa_irt_controller.js'
import { middleware } from '#start/kernel'

const controller = new MapaIRTController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/list', controller.list.bind(controller))
    router.get('/active', controller.active.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/mapa-irt')
     .use([middleware.auth()])
}
