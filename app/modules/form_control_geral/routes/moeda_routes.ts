import router from '@adonisjs/core/services/router'
import MoedaController from '../controllers/moeda_controller.js'
import { middleware } from '#start/kernel'

const controller = new MoedaController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.list.bind(controller))
    router.get('/:id', controller.show.bind(controller))
  }).prefix('/moedas')
  .use([middleware.auth()])
}
