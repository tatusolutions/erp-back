import Empresa from '../models/Empresa.js'
import User from '../../control-de-acesso/models/user.js'
import fs from 'node:fs'
import app from '@adonisjs/core/services/app'

export default class EmpresaService {
  async listAll(page: number = 1, limit: number = 10) {
    return await Empresa.query().preload('moeda').preload('municipio').paginate(page, limit)
  }

  async list() {
    return await Empresa.all()
  }

  async findById(id: number) {
    return await Empresa.query()
      .where('id', id)
      .preload('moeda')
      .preload('municipio', (municipioQuery) => {
        municipioQuery.preload('provincia')
      })
      .firstOrFail()
  }

  async create(data: any) {
    const empresa = await Empresa.create(data.empresa)

    const user = await User.create({
      ...data.user,
      empresa_id: empresa.id,
    })
    const token = await User.accessTokens.create(user)

    return { empresa, user, token }
  }

  async create_only(data: Partial<Empresa>) {
    return await Empresa.create(data)
  }

  async update(id: number, data: Partial<Empresa>) {
    const dado = await Empresa.findOrFail(id)
    dado.merge(data)
    await dado.save()
    return dado
  }

  async delete(id: number) {
    const dado = await Empresa.findOrFail(id)
    await dado.delete()
  }

  public async atualizarLogo(id: number, logoFile: any): Promise<string> {
    const empresa = await Empresa.findOrFail(id)

    const fileName = `${Date.now()}_${logoFile.clientName}`
    const logoFolder = app.publicPath('uploads/empresas/logotipos')
    const logoPath = `uploads/empresas/logotipos/${fileName}`

    await logoFile.move(logoFolder, {
      name: fileName,
      overwrite: true,
    })

    if (!logoFile.isValid) {
      throw new Error('Erro ao mover o ficheiro')
    }

    // Apagar logo antigo
    if (empresa.logotipo) {
      const oldPath = app.publicPath(empresa.logotipo)
      try {
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath)
        }
      } catch (err) {
        console.warn('Erro ao apagar logo antigo:', err)
      }
    }

    empresa.logotipo = logoPath
    await empresa.save()

    return logoPath
  }
}
