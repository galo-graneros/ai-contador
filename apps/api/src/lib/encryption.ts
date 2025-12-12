import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    console.warn('⚠️ ENCRYPTION_KEY should be at least 32 characters for security')
}

export function encrypt(text: string): string {
    if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured')
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
}

export function decrypt(ciphertext: string): string {
    if (!ENCRYPTION_KEY) throw new Error('ENCRYPTION_KEY not configured')
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
    return bytes.toString(CryptoJS.enc.Utf8)
}

export function hashSensitive(text: string): string {
    return CryptoJS.SHA256(text).toString()
}
