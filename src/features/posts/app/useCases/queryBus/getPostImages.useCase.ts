import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { ImageInfo } from 'src/features/blogs/domain/image.types';
import { ImageInfoRepository } from 'src/features/blogs/infrastructure/blog-image.repository';
import { ImageStorageService } from 'src/features/blogs/infrastructure/image-storage.service';

export class GetPostImagesQuery {
  constructor(public postId: string) {}
}

@QueryHandler(GetPostImagesQuery)
export class GetPostImagesUseCase implements IQueryHandler<GetPostImagesQuery> {
  constructor(
    private readonly imageStorageService: ImageStorageService,
    private readonly imageRepository: ImageInfoRepository,
  ) {}
  async execute(command: GetPostImagesQuery): Promise<ImageInfo> {
    const mainImagesInfo = await this.imageRepository.getPostWMainImagesInfo(command.postId);
    const imagesInfo: ImageInfo = {
      main: [],
    };

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
