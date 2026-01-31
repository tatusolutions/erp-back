import { createSign, createVerify } from 'crypto'
import { readFileSync } from 'fs'

// Lê as chaves do diretório public
const privateKey = readFileSync('./public/chave_privada.txt', 'utf-8')
const publicKey = readFileSync('./public/chave_publica.txt', 'utf-8')

// Texto de exemplo para assinar
const data = 'teste123'

// Cria a assinatura digital
const sign = createSign('RSA-SHA256')
sign.update(data)
sign.end()
const signature = sign.sign({
    key: privateKey,
    format: 'pem',
    passphrase: '011998'
  }).toString('base64')  


console.log('🖋️ Assinatura Base64:', signature)

// Verifica se a assinatura é válida
const verify = createVerify('RSA-SHA256')
verify.update(data)
verify.end()

const isValid = verify.verify(publicKey, signature, 'base64')

console.log('✅ Assinatura válida?', isValid)
