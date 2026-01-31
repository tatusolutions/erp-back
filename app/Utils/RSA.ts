import { 
    createPrivateKey, 
    createPublicKey, 
    privateEncrypt, 
    publicEncrypt, 
    privateDecrypt, 
    publicDecrypt, 
    createSign, 
    createVerify 
} from 'crypto';

export default class RSA {
    private static readonly PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCwLRTKAW1wWBnN+JDL+IURdn/U
mCzRkldbt5AMHvn6hHp7N09fg+yTpfKs5IPBtxPzqH57mVhxCdrWO/WSoWNWcOL5
CIopb9h1JQbG8H0TvcRQYlG4iQxL8U2kz6rUMgI1UaQfD9B/QbzpNBZk/4c6BkcH
VVNTalOppakmbabNxwIDAQAB
-----END PUBLIC KEY-----`;

    private static readonly PRIVATE_KEY = `-----BEGIN RSA PRIVATE KEY-----
MIICWwIBAAKBgQCwLRTKAW1wWBnN+JDL+IURdn/UmCzRkldbt5AMHvn6hHp7N09f
g+yTpfKs5IPBtxPzqH57mVhxCdrWO/WSoWNWcOL5CIopb9h1JQbG8H0TvcRQYlG4
iQxL8U2kz6rUMgI1UaQfD9B/QbzpNBZk/4c6BkcHVVNTalOppakmbabNxwIDAQAB
AoGAPvBMDgLGiy0eQuQ7LnNhbqSr9FJNKK2kQeLpNjtWyPXNH/nZhGEIApN1h+i3
XVw/Z3vZe+SDoRaJNKIFEFZRuzaWvF6jj1dqIsdcfypCAVvG6CW8Du6ujsxpLhGN
eNL8ZJusb0ugnYMsHPOE7qFX286yxNOEjtSfgOaxC6fYCpkCQQDnp92RlwGea0ve
NO41wozYZAiqcLXVolMXwAyHmcBjy19QKNTMRkM1gw3IkZ5DjS+XQS6mZwz55Sso
MOted61TAkEAwrCrz/905I5M5P1FZSgRpCEi9jZEcIC7SovZ4MnLOx2Mwe6iW/Ij
xsE94rOa++Rg8CuKnFd6674h4E20RqJbPQJAW+KmrRfziW3PwwzFq8dGbJKJKWnZ
hiqDwPjpP2QJ/sttO/NmLLx17iTUc8jmuK6owNsW8OQRLpHq4188DNV1hwJAcpRb
aZxkhSaiZpoQP0pnp3rBArpJaRS6JVNNNRhN/UqUzoXNE+Pb3ltYOpWNfvWXf4GA
oCZz9038ze+tS2y92QJAcxg6J5tALMC8p4ZKGwK1Mpoo3nD85Uz4O41ZOm7pbYKT
otfdjVZ5XlxCGRQC3MfKXA/wXm4ag79ddtuXPL1SqA==
-----END RSA PRIVATE KEY-----`;

    private static getPrivateKey() {
        return createPrivateKey({
            key: RSA.PRIVATE_KEY,
            format: 'pem',
            type: 'pkcs1',
        });
    }

    private static getPublicKey() {
        return createPublicKey({
            key: RSA.PUBLIC_KEY,
            format: 'pem',
            type: 'spki',
        });
    }

    public static privateEncrypt(data: string): string | null {
        if (typeof data !== 'string') {
            return null;
        }
        try {
            const encrypted = privateEncrypt(
                this.getPrivateKey(),
                Buffer.from(data, 'utf8')
            );
            return encrypted.toString('base64');
        } catch (error) {
            console.error('Error in privateEncrypt:', error);
            return null;
        }
    }

    public static publicEncrypt(data: string): string | null {
        if (typeof data !== 'string') {
            return null;
        }
        try {
            const encrypted = publicEncrypt(
                this.getPublicKey(),
                Buffer.from(data, 'utf8')
            );
            return encrypted.toString('base64');
        } catch (error) {
            console.error('Error in publicEncrypt:', error);
            return null;
        }
    }

    public static privateDecrypt(encrypted: string): string | null {
        if (typeof encrypted !== 'string') {
            return null;
        }
        try {
            const decrypted = privateDecrypt(
                this.getPrivateKey(),
                Buffer.from(encrypted, 'base64')
            );
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Error in privateDecrypt:', error);
            return null;
        }
    }

    public static publicDecrypt(encrypted: string): string | null {
        if (typeof encrypted !== 'string') {
            return null;
        }
        try {
            const decrypted = publicDecrypt(
                this.getPublicKey(),
                Buffer.from(encrypted, 'base64')
            );
            return decrypted.toString('utf8');
        } catch (error) {
            console.error('Error in publicDecrypt:', error);
            return null;
        }
    }

    public static createSign(data: string): string | null {
        if (typeof data !== 'string') {
            return null;
        }
        try {
            const sign = createSign('RSA-SHA1');
            sign.update(data);
            return sign.sign(this.getPrivateKey(), 'base64');
        } catch (error) {
            console.error('Error in createSign:', error);
            return null;
        }
    }

    public static verifySign(data: string, signature: string): boolean {
        if (typeof data !== 'string' || typeof signature !== 'string') {
            return false;
        }
        try {
            const verify = createVerify('RSA-SHA1');
            verify.update(data);
            return verify.verify(
                this.getPublicKey(),
                signature,
                'base64'
            );
        } catch (error) {
            console.error('Error in verifySign:', error);
            return false;
        }
    }
}
