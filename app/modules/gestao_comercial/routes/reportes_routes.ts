import { middleware } from '#start/kernel'
import ReporteController from '../controllers/ReporteSaftController.js'

const controller = new ReporteController()

export default function (router: any) {
  const route = router.group(() => {
    // Report CRUD endpoints
    router.get('/', controller.index.bind(controller))
    router.post('/', controller.store.bind(controller))
    router.get('/:id', controller.show.bind(controller))
    router.put('/:id', controller.update.bind(controller))
    router.delete('/:id', controller.destroy.bind(controller))
    router.get('/:id/download-saft', controller.downloadSaft.bind(controller))
  })

  route.prefix('/reportes')
  route.use([middleware.auth()])
  return route
}