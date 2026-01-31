import User from '../models/user.js'
import Role from '../models/role.js'
import { Exception } from '@adonisjs/core/exceptions'

export default class AuthService {
  private async ensureDefaultRole(): Promise<Role> {
    // Verificar se role padrão (Admin) existe
    let adminRole = await Role.find(1)
    
    if (!adminRole) {   
      adminRole = await Role.create({
        name: 'Admin',
        slug: 'admin'
      }) 
    } else {
      console.log('✅ Role padrão encontrada:', adminRole.id)
    }
    
    return adminRole
  }

  public async register_with_empresa(
    nome: string,
    email: string,
    password: string,
    empresaId: number
  ) {
    try {
      
      // Criar usuário com empresa_id e role padrão (1 = Admin)
      const user = await User.create({
        name: nome,
        username: email.split('@')[0],
        email,
        password,
        empresaId,
        roleId: 1
      })
      
      // Carregar empresa
      await user.load('empresa') 
      
      // Tentar carregar role com permissões
      try {
        await user.load('role', (query) => {
          query.preload('permissoes', (permQuery) => {
            permQuery.preload('permissao')
          })
        }) 
      } catch (roleError) {
        console.log('⚠️ Erro ao carregar role/permissões:', roleError.message)
      }

      // Extrair permissões do usuário
      const permissoes = []
      if (user.role && user.role.permissoes) { 
        for (const permissaoRole of user.role.permissoes) {
          if (permissaoRole.permissao) {
            permissoes.push({
              id: permissaoRole.permissao.id,
              nome: permissaoRole.permissao.name,
              slug: permissaoRole.permissao.slug
            })
          }
        }
      } else { 
      }

      const token = await User.accessTokens.create(user) 

      const result = {
        user: {
          ...user.serialize(),
          permissoes
        },
        token,
      }
       
      return result
      
    } catch (error) {
      throw error
    }
  }

  public async login(email: string, password: string) {
    try { 
      const user = await User.verifyCredentials(email, password) 
      
      // Verificar se usuário tem roleId, se não, atribuir role padrão
      if (!user.roleId) { 
        await this.ensureDefaultRole()
        user.roleId = 1
        await user.save()
      }
      
      // Carregar a empresa
      await user.load('empresa') 
      
      // Tentar carregar role com permissões
      try {
        await user.load('role', (query) => {
          query.preload('permissoes', (permQuery) => {
            permQuery.preload('permissao')
          })
        }) 
      } catch (roleError) {
        console.log('⚠️ Erro ao carregar role/permissões:', roleError.message)
        // Continuar sem permissões se houver erro
      }

      // Extrair permissões do usuário
      const permissoes = []
      if (user.role && user.role.permissoes) { 
        for (const permissaoRole of user.role.permissoes) {
          if (permissaoRole.permissao) {
            permissoes.push({
              id: permissaoRole.permissao.id,
              nome: permissaoRole.permissao.name,
              slug: permissaoRole.permissao.slug
            })
          }
        }
      } else {
        console.log('⚠️ Nenhuma permissão encontrada, usando array vazio')
      }

      const token = await User.accessTokens.create(user) 

      const result = {
        user: {
          ...user.serialize(),
          permissoes
        },
        token,
      } 
      return result
      
    } catch (error) { 
      throw new Exception('Invalid credentials', { status: 400 })
    }
  }
}
