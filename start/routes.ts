/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import loadModules from '../app/modules/module_loader.js'
import router from '@adonisjs/core/services/router'
import app from '@adonisjs/core/services/app'
import db from '@adonisjs/lucid/services/db'


// Health check endpoint
/* 
router.get('/health', async ({ response }) => {
  try {
    // Test database connection
    await db.connection().rawQuery('SELECT 1')
    
    return response.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      environment: app.nodeEnvironment
    })
  } catch (error) {
    return response.status(503).json({
      status: 'error',
      message: 'Service unavailable',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})
  */

// Carrega todas as rotas automaticamente
await loadModules()

router.get('/uploads/empresas/logotipos/:filename', ({ params, response }) => {
  return response.download(app.publicPath(`uploads/empresas/logotipos/${params.filename}`))
})
