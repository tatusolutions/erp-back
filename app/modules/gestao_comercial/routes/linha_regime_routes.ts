import router from '@adonisjs/core/services/router'
import LinhaRegimeController from '../controllers/linha_regime_controller.js'
import { middleware } from '#start/kernel'

const controller = new LinhaRegimeController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/linhas-regimes')
  .use([middleware.auth()]) // Proteção se necessário
}
