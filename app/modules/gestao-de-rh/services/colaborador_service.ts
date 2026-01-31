import Colaborador from '../models/Colaborador.js'
import FolhaSalarioService from './folha_salario_service.js'

export default class colaboradorService {
  async listAll(page: number = 1, limit: number = 10, search: string = '') {
    const query = Colaborador.query() 

    if (search) {
        query.whereILike('nome', `%${search}%`)
      }  

    return await query.paginate(page, limit)
  } 

  async list() {
    return await Colaborador.all()
  }

  async findById(id: number) {
    return await Colaborador.findOrFail(id)
  }

  async create(data: Partial<Colaborador>) {
    return await Colaborador.create(data)
  }

  async update(id: number, data: Partial<Colaborador>) {
    const colaborador = await Colaborador.findOrFail(id)
    colaborador.merge(data)
    await colaborador.save()
    return colaborador
  }

  async delete(id: number) {
    const colaborador = await Colaborador.findOrFail(id)
    await colaborador.delete()
  }

  async verificarFolhaColaborador(id: number): Promise<boolean> {
    console.log(`🔍 [BACKEND] Verificando folha para colaborador ID: ${id}`);
    
    const folhaService = new FolhaSalarioService();
    const folhas = await folhaService.findByColaborador(id);
    
    console.log(`📊 [BACKEND] Registros encontrados: ${folhas.length}`);
    
    const temFolha = folhas.length > 0;
    console.log(`📋 [BACKEND] Colaborador tem folha? ${temFolha}`);
    
    return temFolha
  }

  async getEmpresaByColaboradorId(id: number) {
    const colaborador = await Colaborador.query()
      .where('id', id)
      .preload('empresa')
      .first()
    
    if (!colaborador || !colaborador.empresa) {
      throw new Error('Empresa não encontrada para este colaborador')
    }
    
    return colaborador.empresa
  }

  async atualizarStatus(id: number, status: string): Promise<void> {
    const colaborador = await Colaborador.findOrFail(id)
    colaborador.estado = status
    await colaborador.save()
  }
}
