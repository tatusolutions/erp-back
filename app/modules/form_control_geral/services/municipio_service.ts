import Municipio from '../models/Municipio.js'

export default class MunicipioService {
  async list(idProvincia: number) {
    return await Municipio.query().where('id_provincia', idProvincia)
  }
}
