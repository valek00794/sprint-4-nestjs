import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ImageStorageService } from '../../infrastructure/image-storage.service';
import { ImageInfoRepository } from '../../infrastructure/blog-image.repository';
import { ImageInfo } from '../../domain/image.types';

export class GetBlogImagesCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogImagesCommand)
export class GetBlogImagesUseCase implements ICommandHandler<GetBlogImagesCommand> {
  constructor(
    private readonly blogImageStorageService: ImageStorageService,
    private readonly blogImageRepository: ImageInfoRepository,
  ) {}
  async execute(command: GetBlogImagesCommand): Promise<ImageInfo> {
    const wallpaperInfo = await this.blogImageRepository.getBlogWallpaperInfo(command.blogId);
    const mainImagesInfo = await this.blogImageRepository.getBlogWMainImagesInfo(command.blogId);
    const imagesInfo: ImageInfo = {
      main: [],
      wallpaper: null,
    };
    if (wallpaperInfo) {
      const imageUrl = await this.blogImageStorageService.getImageUrl(wallpaperInfo.key);
      imagesInfo.wallpaper = this.blogImageRepository.mapToOutput(wallpaperInfo, imageUrl);
    }

    if (mainImagesInfo) {
      for (const image of mainImagesInfo) {
        const imageUrl = await this.blogImageStorageService.getImageUrl(image.key);
        const mainImage = this.blogImageRepository.mapToOutput(image, imageUrl);
        imagesInfo.main.push(mainImage);
      }
    }
    return imagesInfo;
  }
}
