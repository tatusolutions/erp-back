import CodeService from '../services/code_service.js'
import User from '../models/user.js'
import { HttpContext } from '@adonisjs/core/http'

export default class CodeController {
  /**
   * Envia código por email
   */
  public async sendCode({ request, response }: HttpContext) {
    try {
      const email = request.input('email')
      await CodeService.generateAndSend(email)
      return response.ok({ message: 'Enviamos o código de verificação o email fornecido.' })
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }

  /**
   * Valida código
   */
  public async verifyCode({ request, response }: HttpContext) {
    try {
      const { email, code } = request.only(['email', 'code'])

      const record = await CodeService.validate(email, code)

      // Retorne apenas os campos relevantes para o front
      return response.ok({
        message: 'Código válido',
        email: record.email,
        code: record.code,
        estado: record.estado,
      })

    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }

  /**
   * Alterar palavra-passe
   */
  public async resetPassword({ request, response }: HttpContext) {
    try {
      const { email, code, password } = request.only([
        'email',
        'code',
        'password',
      ])

      const record = await CodeService.validate(email, code)

      const user = await User.findBy('email', email)
      if (!user) throw new Error('Usuário não encontrado.')

      user.password = password
      await user.save()

      await CodeService.markUsed(record)

      return response.ok({ message: 'Password alterada com sucesso.' })
    } catch (error) {
      return response.badRequest({ error: error.message })
    }
  }
}
