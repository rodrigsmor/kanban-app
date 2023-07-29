import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { extname } from 'path';
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
          const fileExtension = extname(file.originalname);
          const newFilename = `${filename}-${crypto.randomUUID()}-${Date.now()}${fileExtension}`;
          return cb(null, newFilename);
        },
      }),
    };
  }
}
