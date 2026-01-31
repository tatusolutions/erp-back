import Moeda from '../models/Moeda.js'

export default class MoedaService {
  async listMoeda() {
    return await Moeda.all()
  }
  async showMoeda(id: number) {
    return await Moeda.find(id)
  }
}
