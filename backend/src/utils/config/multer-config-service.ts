import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      dest: './uploads/images',
      storage: diskStorage({
        destination: './uploads/images',
        filename: (req, file, cb) => {
          const mimetypeIndex = file.originalname.lastIndexOf('.');
          const filename = file.originalname.substring(0, mimetypeIndex);
          const newFilename = `${filename}-${crypto.randomUUID()}-${Date.now()}`;
          return cb(null, newFilename);
        },
      }),
    };
  }
}
