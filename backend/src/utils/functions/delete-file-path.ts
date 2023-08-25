import * as fs from 'fs';
import { InternalServerErrorException } from '@nestjs/common';

export async function deleteFilePath(filePath: string): Promise<void> {
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    throw new InternalServerErrorException(
      'It was not possible to update your profile picture. Try again later',
    );
  }
}
