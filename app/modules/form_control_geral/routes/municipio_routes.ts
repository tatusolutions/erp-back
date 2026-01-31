import router from '@adonisjs/core/services/router'
import MunicipioController from '../controllers/municipio_controller.js'
import { middleware } from '#start/kernel'

const controller = new MunicipioController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/:id/getmunicipios', controller.list.bind(controller))
  }).prefix('/municipios')
  .use([middleware.auth()])
}
