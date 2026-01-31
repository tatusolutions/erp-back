import Provincia from '../models/Provincia.js'

export default class ProviciaService {
  async list() {
    return await Provincia.all()
  }
}
