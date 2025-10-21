import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import type { Request } from 'express';
import type { Multer } from 'multer';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Controller('uploads')
export class UploadsController {
  @UseGuards(JwtAuthGuard)
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const ext = (extname(file.originalname) || '').toLowerCase();
          const safeExt = ext && ext.match(/^\.[a-z0-9]+$/i) ? ext : '.png';
          const filename = `${Date.now()}-${randomUUID()}${safeExt}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype?.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('이미지 파일만 업로드할 수 있습니다.') as any,
            false,
          );
        }
      },
    }),
  )
  uploadImage(@UploadedFile() file: Multer.File, @Req() req: Request) {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${file.filename}`;
    return { url };
  }
}
