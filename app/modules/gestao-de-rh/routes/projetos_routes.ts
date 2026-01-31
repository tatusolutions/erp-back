import router from '@adonisjs/core/services/router'
import ProjetosController from '../controllers/projetos_controller.js'
import { middleware } from '#start/kernel'

const controller = new ProjetosController()

export default function (Route: any) {
  Route.group(() => {
    router.get('/', controller.index.bind(controller))
    router.get('/list', controller.list.bind(controller))
    router.get('/ativos', controller.ativos.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.get('/:id/estagiarios-count', controller.contarEstagiariosVinculados.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
    
    // Status management
    router.put('/:id/iniciar', controller.iniciar.bind(controller))
    router.put('/:id/pausar', controller.pausar.bind(controller))
    router.put('/:id/concluir', controller.concluir.bind(controller))
    router.put('/:id/cancelar', controller.cancelar.bind(controller))
    
    // Progress management
    router.put('/:id/progresso', controller.atualizarProgresso.bind(controller))
    
    // Reports
    router.get('/:id/relatorio', controller.relatorio.bind(controller))
  }).prefix('/projetos')
 //  .use([middleware.auth()])
}
