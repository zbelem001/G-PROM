import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRETE,
});

@Injectable()
export class UploadService {
  uploadFile(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'gprom/documents', resource_type: 'auto' },
        (error, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new InternalServerErrorException(error.message));
          } else {
            resolve(result!.secure_url);
          }
        },
      );
      stream.end(file.buffer);
    });
  }
}
