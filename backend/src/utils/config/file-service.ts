import * as fs from 'fs';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FileService {
  async deleteFilePath(filePath: string): Promise<void> {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      throw new InternalServerErrorException('error while deleting file.');
    }
  }
}
