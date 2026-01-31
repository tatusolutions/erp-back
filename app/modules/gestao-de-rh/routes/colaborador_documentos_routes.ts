import ColaboradorDocumentosController from '../controllers/colaborador_documentos_controller.js'
import { middleware } from '#start/kernel'

const controller = new ColaboradorDocumentosController()

export default function (Route: any) {
  Route.group(() => {
    // Rotas gerais (sem parâmetros) - devem vir primeiro
    Route.get('/documentos/tipos', controller.getTipoDocumentos.bind(controller))
    Route.get('/tipo-anexos', controller.getTipoDocumentos.bind(controller)) // Nova rota para compatibilidade
    Route.post('/documentos/check-expired', controller.checkExpired.bind(controller))
    
    // Rotas específicas com parâmetros - ordem importa!
    Route.get('/:colaboradorId/documentos', controller.index.bind(controller))
    Route.post('/:colaboradorId/documentos', controller.store.bind(controller))
    Route.get('/documentos/:id', controller.show.bind(controller))
    Route.put('/documentos/:id', controller.update.bind(controller))
    Route.delete('/documentos/:id', controller.destroy.bind(controller))
    Route.get('/documentos/:id/download', controller.download.bind(controller))
  }).prefix('/colaboradores')
   // .use([middleware.auth()]) // Temporariamente desativado para teste
}
