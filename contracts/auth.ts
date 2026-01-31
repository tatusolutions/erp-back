import User from '../app/modules/control-de-acesso/models/user.js'

declare module '@adonisjs/auth/types' {
  interface Providers {
    user: {
      implementation: typeof User
      config: {
        identifierKey: 'id'
      }
    }
  }
}

declare module '@adonisjs/core/http' {
  interface Request {
    user?: User
  }
}
