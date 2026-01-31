import { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class TestController {
  public async testTaxRegimes({ response }: HttpContext) {
    try {
      const taxRegimes = await db.from('tax_regimes').select('*')
      return response.json({
        success: true,
        count: taxRegimes.length,
        data: taxRegimes
      })
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Error fetching tax regimes',
        error: error.message
      })
    }
  }
}
