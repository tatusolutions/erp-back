import router from '@adonisjs/core/services/router'
import AuthController from '../controllers/auth_controller.js'
import { middleware } from '#start/kernel'

const authController = new AuthController()

export default function (Route: any) {
  Route.group(() => {
    router.post('/register', authController.register.bind(authController))
    router.post('/login', authController.login.bind(authController))
    // router.put('/change-password', authController.changePassword.bind(authController))


    // subgrupo protegido
    Route.group(() => {
      Route.put('/change-password', [AuthController, 'changePassword'])
      Route.get('/users', [AuthController, 'getUsers'])
      Route.get('/me', [AuthController, 'me'])
      Route.put('/:id/edit_user', [AuthController, 'update'])
      Route.post('/:id/foto-perfil', [AuthController, 'uploadProfilePhoto'])
    }).use([middleware.auth()])

  }).prefix('/auth')
}
