import env from '#start/env'
import { defineConfig } from '@adonisjs/lucid'

const dbConfig = defineConfig({
  connection: env.get('DB_CONNECTION', 'mysql'),

  connections: {
    mysql: {
      client: 'mysql2',
      connection: {
        host: env.get('DB_HOST', '127.0.0.1'),
        port: Number(env.get('DB_PORT', 3306)),
        user: env.get('DB_USER'),
        password: env.get('DB_PASSWORD', ''),
        database: env.get('DB_DATABASE'),

        // 🔹 SSL opcional (necessário em muitos provedores remotos)
        ssl: {
          rejectUnauthorized: false,
        },
      },

      // 🔹 Controla o uso de conexões para evitar sobrecarga em servidores remotos
      pool: {
        min: 2,
        max: 20,
        idleTimeoutMillis: 30000,
        // 🔹 Evita erros de timeout durante picos de latência
        acquireTimeoutMillis: 30000,
        createTimeoutMillis: 30000,
        destroyTimeoutMillis: 5000,
      },

      migrations: {
        naturalSort: true,
        paths: ['database/migrations'],
      },
    },
  },
})

export default dbConfig
