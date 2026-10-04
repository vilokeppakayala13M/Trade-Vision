import { CallHandler, ExecutionContext, Injectable, NestInterceptor, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Observable } from 'rxjs';
import { validateImageFile } from '../utils/file-validator.util';

@Injectable()
export class FileUploadInterceptor implements NestInterceptor {
  private readonly fileInterceptor: NestInterceptor;

  constructor(fieldName: string = 'file') {
    const MulterInterceptor = FileInterceptor(fieldName, {
      storage: memoryStorage(),
      limits: {
        fileSize: 2 * 1024 * 1024, // 2MB strict limit
      },
    });
    this.fileInterceptor = new MulterInterceptor();
  }

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();

    await new Promise<void>(async (resolve, reject) => {
      try {
        const obsOrPromise = this.fileInterceptor.intercept(context, {
          handle: () => {
            resolve();
            return {} as Observable<any>;
          },
        });
        
        const obs = obsOrPromise instanceof Promise ? await obsOrPromise : obsOrPromise;
        obs.subscribe({
          error: (err: any) => reject(err),
        });
      } catch (err) {
        reject(err);
      }
    });

    const file = request.file;
    if (file) {
      await validateImageFile(file.buffer);
    }

    return next.handle();
  }
}
