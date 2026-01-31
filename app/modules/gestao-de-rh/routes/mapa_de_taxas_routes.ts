import router from '@adonisjs/core/services/router'
import MapaDeTaxasController from '../controllers/mapa_de_taxas_controller.js'
import { middleware } from '#start/kernel'

const controller = new MapaDeTaxasController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/list', controller.list.bind(controller))
    router.get('/active', controller.active.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/mapa-de-taxas')
     .use([middleware.auth()])
}
