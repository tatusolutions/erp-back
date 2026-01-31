import Route from '@ioc:Adonis/Core/Route'
import Database from '@ioc:Adonis/Lucid/Database'

Route.get('/check-documentos-table', async ({ response }) => {
  try {
    const columns = await Database.rawQuery(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'documentos';
    `)
    
    return {
      status: 'success',
      columns: columns.rows
    }
  } catch (error) {
    return response.status(500).json({
      status: 'error',
      message: error.message
    })
  }
})
