import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { ImageInfoRepository } from 'src/features/blogs/infrastructure/blog-image.repository';
import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { ImageStorageService } from 'src/features/blogs/infrastructure/image-storage.service';

export class UploadBlogWallpaperImageCommand {
  constructor(
    public file: Express.Multer.File,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UploadBlogWallpaperImageCommand)
export class UploadBlogWallpaperImageUseCase
  implements ICommandHandler<UploadBlogWallpaperImageCommand>
{
  constructor(
    private readonly imageStorageService: ImageStorageService,
    private readonly imageInfoRepository: ImageInfoRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
  ) {}
  async execute(command: UploadBlogWallpaperImageCommand) {
    const blog = await this.blogsQueryRepository.findBlogById(command.blogId);
    if (!blog) throw new NotFoundException();
    if (blog.blogOwnerInfo && blog.blogOwnerInfo.id !== command.userId) {
      throw new ForbiddenException(
        'User try to update blog wallpaper that doesnt belong to current user',
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
    return await this.imageInfoRepository.saveWallpaperImageInfo(
      command.blogId,
      savedFile.imageKey,
      width!,
      height!,
      command.file.size,
    );
  }
}
