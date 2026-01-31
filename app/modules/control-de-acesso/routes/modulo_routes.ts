import Route from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ModulosController = () => import('../controllers/modulos_controller.js')

export default function moduloRoutes() {
  Route.group(() => {
    Route.get('/', [ModulosController, 'index'])
    Route.get('/list', [ModulosController, 'list'])
    Route.get('/listAllWithPermissoes', [ModulosController, 'listAllWithPermissoes'])
    Route.post('/', [ModulosController, 'store'])
    Route.get('/:id', [ModulosController, 'show'])
    Route.put('/:id', [ModulosController, 'update'])
    Route.delete('/:id', [ModulosController, 'destroy'])
    Route.get('/:id/permissoes-associadas', [ModulosController, 'permissoesAssociadas'])
    Route.get('/:id/permissoes-nao-associadas', [ModulosController, 'permissoesNaoAssociadas'])
    Route.post('/attachPermissoes', [ModulosController, 'attachPermissoes'])
    Route.post('/detachPermissoes', [ModulosController, 'detachPermissoes'])
  }).prefix('/modulos')
   .middleware([middleware.auth()])
}
