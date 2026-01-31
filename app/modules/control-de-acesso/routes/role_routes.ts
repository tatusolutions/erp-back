import router from '@adonisjs/core/services/router'
const RolesController = () => import('../controllers/roles_controller.js')
const PermissaoRoleController = () => import('../controllers/permissao_role_controller.js')
import { middleware } from '#start/kernel'

const Route = router

export default function roleRoutes() {
  Route.group(() => {
    Route.get('/', [RolesController, 'index'])
    Route.get('/list', [RolesController, 'list'])
    Route.post('/', [RolesController, 'store'])
    Route.get('/:id', [RolesController, 'show'])
    Route.put('/:id', [RolesController, 'update'])
    Route.delete('/:id', [RolesController, 'destroy'])

    Route.post('/syncRolePermissoes', [PermissaoRoleController, 'syncRolePermissoes'])
    Route.get('/:id/listModulosByRole', [
      PermissaoRoleController,
      'listModulosWithPermissoesByRole',
    ])
  }).prefix('/roles')
   .middleware([middleware.auth()]) // Protege todas as rotas
}
