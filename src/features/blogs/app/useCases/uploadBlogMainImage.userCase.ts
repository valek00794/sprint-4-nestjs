import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';

import { ImageStorageService } from '../../infrastructure/image-storage.service';
import { ImageInfoRepository } from '../../infrastructure/blog-image.repository';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { ForbiddenException } from '@nestjs/common';
import { BlogMainImagesInfo } from '../../infrastructure/blog-main-images-info.entity';

export class UploadBlogMainImageCommand {
  constructor(
    public file: Express.Multer.File,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UploadBlogMainImageCommand)
export class UploadBlogMainImageUseCase implements ICommandHandler<UploadBlogMainImageCommand> {
  constructor(
    private readonly imageStorageService: ImageStorageService,
    private readonly imageInfoRepository: ImageInfoRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute(command: UploadBlogMainImageCommand) {
    const blog = await this.blogsQueryRepository.findBlogById(command.blogId);
    if (!blog || (blog.blogOwnerInfo && blog.blogOwnerInfo.id !== command.userId)) {
      throw new ForbiddenException(
        'User try to add blog main image that doesnt belong to current user',
      );
    }

    const savedFile = await this.imageStorageService.saveBlogImage(
      command.blogId,
      command.userId,
      command.file.buffer,
      command.file.mimetype,
    );
    const metadata = await sharp(command.file.buffer).metadata();
    const width = metadata.width;
    const height = metadata.height;

    const newImage = new BlogMainImagesInfo();
    newImage.blogId = command.blogId;
    newImage.key = savedFile.imageKey;
    newImage.width = width!;
    newImage.height = height!;
    newImage.size = command.file.size;

    return await this.imageInfoRepository.saveMainImageInfo(newImage);
  }
}
