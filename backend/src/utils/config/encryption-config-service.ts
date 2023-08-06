import { Injectable } from '@nestjs/common';
import { InviteDataTypes } from '../@types';
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';

@Injectable()
export class EncryptConfigService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly salt = process.env.ENCRYPT_SALT;

  async encrypt(data: InviteDataTypes): Promise<string> {
    const dataString = JSON.stringify(data);
    const key = await this.generateKey(`${process.env.JWT_SECRET_KEY}-invite`);
    const iv = randomBytes(16);
    const cipher = createCipheriv(this.algorithm, key, iv);
    let encryptedData = cipher.update(dataString, 'utf-8', 'hex');
    encryptedData += cipher.final('hex');
    return iv.toString('hex') + encryptedData;
  }

  async decrypt(encryptedData: string): Promise<InviteDataTypes> {
    try {
      const key = await this.generateKey(
        `${process.env.JWT_SECRET_KEY}-invite`,
      );
      const iv = Buffer.from(encryptedData.slice(0, 32), 'hex');
      const data = encryptedData.slice(32);
      const decipher = createDecipheriv(this.algorithm, key, iv);
      let decryptedData = decipher.update(data, 'hex', 'utf8');
      decryptedData += decipher.final('utf8');
      return JSON.parse(decryptedData);
    } catch (error) {
      console.error('Error while decrypting:', error.message);
      throw new Error('Failed to decrypt the data');
    }
  }

  private async generateKey(secretKey: string): Promise<Buffer> {
    const key = await new Promise<Buffer>((resolve, reject) => {
      scrypt(secretKey, this.salt, 32, (err, derivedKey) => {
        if (err) reject(err);
        resolve(derivedKey);
      });
    });

    return key;
  }
}
