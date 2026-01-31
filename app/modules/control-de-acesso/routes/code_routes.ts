import Route from '@adonisjs/core/services/router'

const CodeController = () => import('../controllers/code_controller.js')

export default function codeRoutes() {
    Route.group(() => {
        Route.post('/send-code', [CodeController, 'sendCode'])
        Route.post('/verify-code', [CodeController, 'verifyCode'])
        Route.post('/reset-password', [CodeController, 'resetPassword'])
    })
        .prefix('/auth')
}
