import Code from '../models/code.js'
import User from '../models/user.js'
import { sendCodeMail } from '../mail/send_code_mail.js'

import { DateTime } from 'luxon'

export default class CodeService {
  /**
   * Gera código e envia por email
   */
  public static async generateAndSend(email: string) {
    const user = await User.findBy('email', email)
    if (!user) throw new Error('Email não encontrado.')

    const codeValue = Math.floor(100000 + Math.random() * 900000).toString()

    const code = await Code.create({
      email,
      code: codeValue,
      estado: 'activo',
    })

    await sendCodeMail(code)

    return code
  }

  public static async validate(email: string, code: string) {
    const record = await Code.query()
      .where('email', email)
      .where('code', code)
      .first()

    if (!record) throw new Error('Código inválido.')

    // --- Expiração ---
    if (!record.createdAt) {
      throw new Error('Registro inválido: sem data de criação.')
    }

    // Converte para DateTime se necessário
    const createdAt = DateTime.fromJSDate(record.createdAt.toJSDate?.() || record.createdAt)
    const now = DateTime.now()

    const diffMinutes = now.diff(createdAt, 'minutes').minutes

    if (diffMinutes > 10) { // tempo de validade do código em minutos
      record.estado = 'expirado'
      await record.save()
      throw new Error('Código expirado.')
    }

    // Verifica estado
    if (record.estado !== 'activo') {
      throw new Error('Código inválido.')
    }

    return record
  }

  /**
   * Marca o código como usado
   */
  public static async markUsed(record: Code) {
    record.estado = 'usado'
    await record.save()
  }
}
