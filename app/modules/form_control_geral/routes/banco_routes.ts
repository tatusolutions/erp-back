import router from '@adonisjs/core/services/router'
import BancoController from '../controllers/banco_controller.js'
import app from '@adonisjs/core/services/app'
import { middleware } from '#start/kernel'

const controller = new BancoController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
    router.get('/list_moedas', controller.listMoeda.bind(controller))
    //Permite ter acesso as imagens do banco
    router.get('/uploads/flag_banck/:filename', ({ params, response }) => {
      return response.download(app.publicPath(`uploads/flag_banck/${params.filename}`))
    })
  }).prefix('/bancos')
  .use([middleware.auth()])
}
