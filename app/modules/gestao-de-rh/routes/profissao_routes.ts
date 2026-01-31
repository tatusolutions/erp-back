import router from '@adonisjs/core/services/router'
import ProfissoesController from '../controllers/profissoes_controller.js'
import { middleware } from '#start/kernel'

const controller = new ProfissoesController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/profissoes')
    .use([middleware.auth()])
}
