import { BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';

export async function validateImageFile(buffer: Buffer): Promise<void> {
  try {
    const metadata = await sharp(buffer).metadata();
    
    if (!metadata.format || !['jpeg', 'jpg', 'png', 'webp'].includes(metadata.format)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    if (metadata.width && metadata.height) {
      if (metadata.width > 2000 || metadata.height > 2000) {
        throw new BadRequestException('Image dimensions exceed maximum allowed (2000x2000)');
      }
    }
  } catch (error) {
    if (error instanceof BadRequestException) throw error;
    throw new BadRequestException('Invalid image data');
  }
}
