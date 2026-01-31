import router from '@adonisjs/core/services/router'
import ModeloFacturaController from '../controllers/modelos_factura_controller.js'
import { middleware } from '#start/kernel'

const controller = new ModeloFacturaController()

export default function (Route: any) {
  Route.group(() => {
    // Main CRUD endpoints
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))

    // Bank management endpoints
    router.get('/:modeloFacturaId/bancos', controller.listBancos.bind(controller))
    router.post('/:modeloFacturaId/bancos', controller.addBanco.bind(controller))
    router.put('/:modeloFacturaId/bancos/:bancoId', controller.updateBanco.bind(controller))
    router.delete('/:modeloFacturaId/bancos/:bancoId', controller.removeBanco.bind(controller))
    router.put('/:modeloFacturaId/bancos/sincronizar', controller.syncBancos.bind(controller))

  }).prefix('/modelo-factura')
  .use([middleware.auth()])
}