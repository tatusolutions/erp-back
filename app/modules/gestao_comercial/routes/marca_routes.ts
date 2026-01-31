import router from '@adonisjs/core/services/router'
import MarcaController from '../controllers/marca_controller.js'
import { middleware } from '#start/kernel'

const controller = new MarcaController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/marcas')
  .use([middleware.auth()]) // Se quiser proteger as rotas
}
