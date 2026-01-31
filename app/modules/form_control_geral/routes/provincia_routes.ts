import router from '@adonisjs/core/services/router'
import ProvinciaController from '../controllers/provincia_controller.js'
import { middleware } from '#start/kernel'

const controller = new ProvinciaController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.list.bind(controller))
  }).prefix('/provincias')
    .use([middleware.auth()])
}
