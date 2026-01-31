import Armazen from '../models/Armazen.js'

export default class ArmazenService {
  async listAll(page: number = 1, limit: number = 10, search: string = '', estado: string | null = null) {
    const query = Armazen.query()

    if (search) {
      query.whereILike('nome', `%${search}%`)
    }

    if (estado) {
      query.where('estado', estado)
    }

    return await query.paginate(page, limit)
  }

  async list() {
    return await Armazen.all()
  }

  async findById(id: number) {
    return await Armazen.findOrFail(id)
  }

  async create(data: Partial<Armazen>) {
    // If serie is not provided, get the next available one
    if (!data.serie && data.idEmpresa) {
      const { proxima_serie } = await this.getProximaSerie(data.idEmpresa);
      data.serie = proxima_serie;
    }
    
    // Create the armazem
    const armazem = await Armazen.create(data);
    
    // After creation, update the next series number in the console
    console.log(`Novo armazém criado com a série: ${armazem.serie}`);
    if (data.idEmpresa) {
      const { proxima_serie } = await this.getProximaSerie(data.idEmpresa);
      console.log('Próxima série disponível:', proxima_serie);
    }
    
    return armazem;
  }

  async update(id: number, data: Partial<Armazen>) {
    const armazen = await Armazen.findOrFail(id)
    armazen.merge(data)
    await armazen.save()
    return armazen
  }

  async delete(id: number) {
    const armazen = await Armazen.findOrFail(id)
    await armazen.delete()
  }

  async verificarSerieExistente(serie: string, empresaId: number): Promise<{ existe: boolean }> {
    const count = await Armazen.query()
      .where('serie', serie)
      .andWhere('idEmpresa', empresaId)
      .count('* as total')
      .first()
    
    return { existe: Number(count?.$extras.total) > 0 }
  }

  async getProximaSerie(empresaId: number): Promise<{ proxima_serie: string }> {
    console.log(`Buscando próxima série para empresa ID: ${empresaId}`);
    try {
      // Find all series numbers for the given company
      const results = await Armazen.query()
        .select('id', 'serie', 'descricao')
        .where('idEmpresa', empresaId)
        .orderBy('id', 'desc')
      
      console.log(`Séries encontradas:`, results.map(r => r.serie).join(', ') || 'Nenhuma série encontrada');
      
      if (results.length === 0) {
        console.log('Nenhuma série encontrada, retornando 001');
        return { proxima_serie: '001' };
      }
      
      // Extract all numeric series values
      const seriesNumbers = results
        .map(r => parseInt(r.serie, 10))
        .filter(n => !isNaN(n));
      
      if (seriesNumbers.length === 0) {
        console.log('Nenhuma série numérica válida encontrada, retornando 001');
        return { proxima_serie: '001' };
      }
      
      // Find the highest number and increment it
      const highestNumber = Math.max(...seriesNumbers);
      const nextNumber = highestNumber + 1;
      const proximaSerie = String(nextNumber).padStart(3, '0');
      
      console.log(`Maior número de série encontrado: ${highestNumber}, próxima série: ${proximaSerie}`);
      
      return { proxima_serie: proximaSerie };
    } catch (error) {
      console.error('Error in getProximaSerie:', error);
      return { proxima_serie: '001' };
    }
  }
}
