import * as crypto from 'crypto';

export function encrypt(plaintext: string): string {
  const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY || '0000000000000000000000000000000000000000000000000000000000000000', 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('hex'), tag.toString('hex'), encrypted.toString('hex')].join(':');
}

export function decrypt(ciphertext: string): string {
  const key = Buffer.from(process.env.FIELD_ENCRYPTION_KEY || '0000000000000000000000000000000000000000000000000000000000000000', 'hex');
  const [ivHex, tagHex, encryptedHex] = ciphertext.split(':');
  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error('Invalid ciphertext format');
  }
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function encryptIfPresent(value: string | undefined): string | undefined {
  return value ? encrypt(value) : undefined;
}

export function decryptIfPresent(value: string | undefined): string | undefined {
  return value ? decrypt(value) : undefined;
}
