import router from '@adonisjs/core/services/router'
import VariacaoController from '../controllers/variacao_controller.js'
import { middleware } from '#start/kernel'

const controller = new VariacaoController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/variacoes')
  .use([middleware.auth()]) // Adicione esta linha se quiser proteger as rotas
}
