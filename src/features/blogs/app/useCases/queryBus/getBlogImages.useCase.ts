import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ImageStorageService } from '../../../infrastructure/image-storage.service';
import { ImageInfoRepository } from '../../../infrastructure/blog-image.repository';
import { ImageInfo } from '../../../domain/image.types';

export class GetBlogImagesQuery {
  constructor(public blogId: string) {}
}

@QueryHandler(GetBlogImagesQuery)
export class GetBlogImagesUseCase implements IQueryHandler<GetBlogImagesQuery> {
  constructor(
    private readonly imageStorageService: ImageStorageService,
    private readonly imageRepository: ImageInfoRepository,
  ) {}
  async execute(command: GetBlogImagesQuery): Promise<ImageInfo> {
    const wallpaperInfo = await this.imageRepository.getBlogWallpaperInfo(command.blogId);
    const mainImagesInfo = await this.imageRepository.getBlogWMainImagesInfo(command.blogId);
    const imagesInfo: ImageInfo = {
      main: [],
      wallpaper: null,
    };
    if (wallpaperInfo) {
      const imageUrl = await this.imageStorageService.getImageUrl(wallpaperInfo.key);
      imagesInfo.wallpaper = this.imageRepository.mapToOutput(wallpaperInfo, imageUrl);
    }

    if (mainImagesInfo) {
      for (const image of mainImagesInfo) {
        const imageUrl = await this.imageStorageService.getImageUrl(image.key);
        const mainImage = this.imageRepository.mapToOutput(image, imageUrl);
        imagesInfo.main.push(mainImage);
      }
    }
    return imagesInfo;
  }
}
