import * as fs from 'fs';
import { InternalServerErrorException } from '@nestjs/common';

export class FileFunctions {
  async deleteFilePath(filePath: string): Promise<void> {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      throw new InternalServerErrorException('error while deleting file.');
    }
  }
}
