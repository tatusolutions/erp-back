import type { HttpContext } from '@adonisjs/core/http'
import EmpresaService from '../services/empresa_service.js'

export default class EmpresaController {
  constructor(private service = new EmpresaService()) {}

  public async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const data = await this.service.listAll(page, limit)
    return response.status(200).json({ data })
  }

  public async list({ response }: HttpContext) {
    const data = await this.service.list()
    return response.status(200).json({ data })
  }

  public async store({ request, response }: HttpContext) {
    const body = request.only([
      'nome_comercial',
      'email',
      'nif',
      'user_email',
      'user_password',
      'user_name',
      'user_telefone',
    ])

    const empresaData = { nome_comercial: body.nome_comercial, email: body.email, nif: body.nif }
    const userData = {
      email: body.user_email,
      password: body.user_password,
      name: body.user_name,
      telefone: body.user_telefone,
    }

    await this.service.create({ empresa: empresaData, user: userData })

    return response.status(201).json({
      data: {
        message: 'Empresa criada com sucesso',
      },
    })
  }

  async store_only({ request, response }: HttpContext) {
    await this.service.create_only(request.all())

    return response.status(201).json({
      data: {
        message: 'Empresa criada com sucesso',
      },
    })
  }

  async show({ params, response }: HttpContext) {
    const data = await this.service.findById(params.id)
    return response.status(200).json({ data })
  }

  async update({ params, request, response }: HttpContext) {
    await this.service.update(params.id, request.all())
    return response.status(201).json({
      data: {
        message: 'Empresa Editada com sucesso',
      },
    })
  }

  public async uploadLogo({ params, request, response }: HttpContext) {
    const logoFile = request.file('logotipo', {
      extnames: ['jpg', 'png', 'jpeg'],
      size: '2mb',
    })

    if (!logoFile) {
      return response.badRequest({ error: 'Ficheiro logotipo é obrigatório' })
    }

    try {
      const logoPath = await this.service.atualizarLogo(params.id, logoFile)
      return response.ok({
        message: 'Logotipo atualizado com sucesso',
        logotipo: logoPath,
      })
    } catch (error) {
      return response.internalServerError({ error: error.message })
    }
  }

  async destroy({ params, response }: HttpContext) {
    await this.service.delete(params.id)
    return response.noContent()
  }
}
