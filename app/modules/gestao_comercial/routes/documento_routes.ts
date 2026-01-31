import router from '@adonisjs/core/services/router'
import DocumentoController from '../controllers/documento_controller.js'
import { middleware } from '#start/kernel'

const controller = new DocumentoController()

export default function (Route: any) {
  Route.group(() => {
    // Document type and name endpoints
    router.get('/tipos', controller.listTipoDocumentos.bind(controller))
    router.get('/gettipoDocumentos', controller.listTipoDocumentos.bind(controller))
    router.get('/nomes', controller.listNomeDocumentos.bind(controller))
    router.get('/tipo/:id/nomes', controller.listNomeDocumentosByIdTipoDoc.bind(controller))
    router.get('/referencia/:id/nomes', controller.getDocumentReferences.bind(controller))

    // Document CRUD endpoints
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
    router.get('/count-by-date-range', controller.countByDateRange.bind(controller))
    router.get('/by-prefix/:prefixo', controller.byPrefix.bind(controller))
    router.get('/vinculados/:id', controller.getVinculados.bind(controller))
    router.post('/:documentoId/enviar-email', controller.enviarDocumentoPorEmail.bind(controller))
    router.post('/:documentoId/gerar-recibo', controller.gerarRecibo.bind(controller))
    router.get('/:documentoId/gerar-recibo', controller.gerarRecibo.bind(controller))
    router.get('/referencia/:id', controller.getDocumentReferences.bind(controller))
    router.put('/:id/cancelar', controller.cancelarRecibo.bind(controller))
    router.get('/:documentoId/relacionados/:nomeDocumentoId', controller.getDocumentosRelacionados.bind(controller))
    router.get('/original/:id_documento_original/:id_nome_documento', controller.getDocumentosByOriginalId.bind(controller))

    // Document items endpoints
    router.post('/:documentoId/itens', controller.storeItem.bind(controller)) // Changed from adicionarItemDocumento to storeItem
    router.get('/:documentoId/itens', controller.listItens.bind(controller))
    router.get('/:documentoId/itens/:itemId', controller.showItem.bind(controller))
    router.put('/:documentoId/itens/:itemId', controller.updateItem.bind(controller))
    router.delete('/:documentoId/itens/:itemId', controller.deleteItem.bind(controller))
  }).prefix('/documentos')
  .use([middleware.auth()]) // Uncomment if you want to protect these routes
}