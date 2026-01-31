import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'
import { readdirSync, existsSync } from 'node:fs'

const fileName = fileURLToPath(import.meta.url)
const dirName = dirname(fileName)

/**
 * Detecta a extensão correta dos arquivos de rota baseado no ambiente
 * Em desenvolvimento: .ts
 * Em produção (build): .js
 */
function getRouteFileExtension(): string {
  // Verifica se o arquivo atual é .js (produção) ou .ts (desenvolvimento)
  const isProduction = fileName.endsWith('.js')
  return isProduction ? '.js' : '.ts'
}

export default async function loadModules() {
  const modulesPath = join(dirName, './')
  const routeExtension = getRouteFileExtension()

  const modules = readdirSync(modulesPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)

  for (const module of modules) {
    try {
      const routesDir = join(modulesPath, module, 'routes')

      // Verifica se a pasta routes existe
      if (!existsSync(routesDir)) {
        continue
      }

      // Lê arquivos que terminam com '_routes.ts' ou '_routes.js' dependendo do ambiente
      const routeFiles = readdirSync(routesDir).filter((file) =>
        file.endsWith(`_routes${routeExtension}`)
      )

      if (routeFiles.length === 0) {
        continue
      }

      for (const file of routeFiles) {
        try {
          const routePath = join(routesDir, file)
          const routeUrl = pathToFileURL(routePath).href

          const routeModule = await import(routeUrl)

          // Chama a função de rota diretamente
          if (typeof routeModule.default === 'function') {
            // console.log(`✅ Carregando rotas do módulo '${module}' - arquivo '${file}'`)
            routeModule.default()
          } else {
            //  console.log(`⚠️ Módulo '${module}' - arquivo '${file}' não exporta função default`)
          }
        } catch (err) {
          //  console.error(`❌ Erro ao carregar rota '${file}' do módulo '${module}':`, err)
        }
      }
    } catch (moduleErr) {
      // console.error(`❌ Erro ao processar módulo '${module}':`, moduleErr)
    }
  }
}
