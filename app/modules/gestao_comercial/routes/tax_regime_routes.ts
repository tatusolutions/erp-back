import router from '@adonisjs/core/services/router'
import TaxRegimeController from '../controllers/TaxRegimeController.js'
import { middleware } from '#start/kernel'

const controller = new TaxRegimeController()

export default function (Route: any) {
  Route.group(() => {
    Route.get('/', controller.index.bind(controller))
    Route.get('/:id', controller.show.bind(controller))
    Route.post('/', controller.store.bind(controller))
    Route.put('/:id', controller.update.bind(controller))
    Route.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/tax-regimes')
  .use([middleware.auth()])
}