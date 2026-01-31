import AuthService from '../services/auth_service.js'
import { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  private authService = new AuthService()

  public async register({ request, response }: HttpContext) {
    try {
      const { 
        email, 
        password, 
        usuario, 
        nif, 
        telefone, 
        nome_comercial
      } = request.only([
        'email', 'password', 'usuario', 'nif', 'telefone', 'nome_comercial'
      ])

      // 1. Primeiro criar a empresa
      const Empresa = (await import('../../empresas/models/Empresa.js')).default
      const empresa = await Empresa.create({
        nome_comercial,
        nif,
        telefone,
        email
      })

      // 2. Depois criar o usuário com o empresa_id
      const user = await this.authService.register_with_empresa(
        usuario,
        email, 
        password,
        empresa.id
      )

      return response.status(201).json({
        success: true,
        message: 'Usuário e empresa criados com sucesso',
        data: {
          user: user.user,
          empresa: empresa.serialize(),
          token: user.token
        }
      })
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: 'Erro ao registrar usuário',
        error: error.message
      })
    }
  }

  public async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])
      const result = await this.authService.login(email, password)
     
      return response.ok(result)
    } catch (error) {
      return response.status(400).json({
        success: false,
        message: error.message || 'Credenciais inválidas',
        error: error.message
      })
    }
  }

  async update({ params, request, response }: HttpContext) {
    const data = request.body()
    await this.authService.update(params.id, data)

    return response.status(201).json({
      data: {
        message: 'Dados editados com sucesso',
      },
    })
  }

  public async changePassword({ request, response, auth }: HttpContext) {
    if (!auth.user) {
      return response.unauthorized({ message: 'Usuário não autenticado' })
    }

    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    try {
      const result = await this.authService.changePassword(auth.user, currentPassword, newPassword)
      return response.ok(result)
    } catch (error) {
      const message =
        error.message === 'Invalid user credentials'
          ? 'A senha atual está incorreta'
          : error.message

      return response.badRequest({ message })
    }
  }

  public async getUsers({ request, response }: HttpContext) {
    const filtrosRecebidos = request.only(['search', 'page', 'limit', 'isPaginate'])

    try {
      const result = await this.authService.listUsers({
        page: Number.parseInt(filtrosRecebidos.page),
        perPage: Number.parseInt(filtrosRecebidos.limit),
        search: filtrosRecebidos.search.toString(),
        isPaginate: filtrosRecebidos.isPaginate,
      })
      return response.ok({
        success: true,
        data: result,
      })
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }

  /**
   * Retorna o perfil do usuário autenticado
   */
  public async me({ auth, response }: HttpContext) {
    try {
      if (!auth.user) {
        return response.unauthorized({
          success: false,
          message: 'Usuário não autenticado',
        })
      }

      const user = await this.authService.getMe(auth.user.id)

      return response.ok({
        success: true,
        data: user,
      })
    } catch (error) {
      return response.internalServerError({
        success: false,
        message: 'Erro interno do servidor',
        error: error.message,
      })
    }
  }

  async uploadProfilePhoto({ request, params, response }: HttpContext) {
    try {
      const image = request.file('imagem', {
        size: '5mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'PNG', 'JPG', 'JPEG', 'WEBP'],
      })

      if (!image) {
        return response.badRequest({ message: 'Nenhuma imagem enviada' })
      }

      const result = await this.authService.updateProfilePhoto(params.id, image)
      return response.ok(result)
    } catch (error) {
      return response.badRequest({ message: error.message })
    }
  }
}
