import router from '@adonisjs/core/services/router'
import EstagiariosController from '../controllers/estagiarios_controller.js'
import { middleware } from '#start/kernel'

const controller = new EstagiariosController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.get('/ativos', controller.ativos.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
    
    // Internship management
    router.put('/:id/iniciar-estagio', controller.iniciarEstagio.bind(controller))
    router.put('/:id/suspender-estagio', controller.suspenderEstagio.bind(controller))
    router.put('/:id/concluir-estagio', controller.concluirEstagio.bind(controller))
    router.put('/:id/cancelar-estagio', controller.cancelarEstagio.bind(controller))
    
    // Certificate management
    router.put('/:id/emitir-certificado', controller.emitirCertificado.bind(controller))
    
    // Performance evaluation
    router.put('/:id/avaliar-desempenho', controller.avaliarDesempenho.bind(controller))
    
    // Documents
    router.get('/:id/documentos', controller.documentos.bind(controller))
    
    // Reports
    router.get('/:id/relatorio', controller.relatorio.bind(controller))
  }).prefix('/estagiarios')
   .use([middleware.auth()])
}
