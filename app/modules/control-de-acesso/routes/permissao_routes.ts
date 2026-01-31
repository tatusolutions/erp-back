import Route from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const PermissoesController = () => import('../controllers/permissoes_controller.js')

export default function permissaoRoutes() {
  Route.group(() => {
    Route.get('/', [PermissoesController, 'index'])
    Route.post('/', [PermissoesController, 'store'])
    Route.get('/:id', [PermissoesController, 'show'])
    Route.put('/:id', [PermissoesController, 'update'])
    Route.delete('/:id', [PermissoesController, 'destroy'])
  }).prefix('/permissoes')
   .middleware([middleware.auth()])
}
