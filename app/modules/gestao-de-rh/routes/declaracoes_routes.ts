import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'
import DeclaracoesController from '../controllers/declaracoes_controller.js'

const controller = new DeclaracoesController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.get('/colaborador/:id_colaborador', controller.byColaborador.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
  }).prefix('/declaracoes')
   .use([middleware.auth()])
}
