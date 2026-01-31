import Code from '../models/code.js'
import Mail from '@adonisjs/mail/services/main'
import env from '#start/env'

export async function sendCodeMail(code: Code) {
  await Mail.send((message) => {
    message
      .from(
        env.get('EMAIL_REMETENTE', 'noreply@seclir.ao'),
        env.get('EMAIL_NOME_REMETENTE', 'Sistema SECLIR')
      )
      .to(code.email)
      .subject('Código de recuperação')
      .html(`
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3>Agência Nacional de Residuos</h3>
          </div>
          <p style="font-size: 16px; color: #555;">Olá,</p>
          <p style="font-size: 16px; color: #555;">Seu código de recuperação de senha é:</p>
          <div style="text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #ffffff; background-color: #3498db; padding: 10px 20px; border-radius: 6px; letter-spacing: 4px;">
              ${code.code}
            </span>
          </div>
          <p style="font-size: 14px; color: #888;">Este código é válido por 10 minutos.</p>
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
          <p style="font-size: 12px; color: #aaa;">Este é um e-mail automático, por favor não responda.</p>
        </div>
      `)
  })
}
