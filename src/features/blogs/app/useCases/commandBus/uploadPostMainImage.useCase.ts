import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import sharp from 'sharp';

import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { PostMainImageInfo } from 'src/features/posts/infrastructure/post-main-image.entity';
import { PostImageSizeType } from 'src/features/blogs/domain/image.types';
import { ImageInfoRepository } from 'src/features/blogs/infrastructure/blog-image.repository';
import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { ImageStorageService } from 'src/features/blogs/infrastructure/image-storage.service';

const IMAGE_TYPE_SIZIES = {
  small: {
    width: 149,
    height: 96,
  },
  middle: {
    width: 300,
    height: 180,
  },
};

export class UploadPostMainImageCommand {
  constructor(
    public file: Express.Multer.File,
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(UploadPostMainImageCommand)
export class UploadPostMainImageUseCase implements ICommandHandler<UploadPostMainImageCommand> {
  constructor(
    private readonly imageStorageService: ImageStorageService,
    private readonly imageInfoRepository: ImageInfoRepository,
    private readonly blogsQueryRepository: BlogsQueryRepository,
    private readonly postsQueryRepository: PostsQueryRepository,
  ) {}

  async execute(command: UploadPostMainImageCommand) {
    const blog = await this.blogsQueryRepository.findBlogById(command.blogId);
    const post = await this.postsQueryRepository.findPostById(command.postId);

    if (!blog || !post) throw new NotFoundException();
    if (blog.blogOwnerInfo && blog.blogOwnerInfo.id !== command.userId) {
      throw new ForbiddenException('User try to update blog that doesnt belong to current user');
    }

    const images = [
      { buffer: command.file.buffer, type: PostImageSizeType.Original },
      {
        buffer: await sharp(command.file.buffer)
          .resize(IMAGE_TYPE_SIZIES.small.width, IMAGE_TYPE_SIZIES.small.height)
          .toBuffer(),
        type: PostImageSizeType.Small,
      },
      {
        buffer: await sharp(command.file.buffer)
          .resize(IMAGE_TYPE_SIZIES.middle.width, IMAGE_TYPE_SIZIES.middle.height)
          .toBuffer(),
        type: PostImageSizeType.Middle,
      },
    ];

    const savedImages = await Promise.all(
      images.map(async (image) => {
        const { width, height, size } = await sharp(image.buffer).metadata();

        const key = await this.imageStorageService.savePostImage(
          command.userId,
          command.blogId,
          command.postId,
          image.buffer,
          command.file.mimetype,
        );

        return { key, type: image.type, width, height, size };
      }),
    );

    await Promise.all(
      savedImages.map(async (si) => {
        const newImage = new PostMainImageInfo();
        newImage.postId = command.postId;
        newImage.key = si.key;
        newImage.sizeType = si.type;
        newImage.width = si.width!;
        newImage.height = si.height!;
        newImage.size = si.size!;

        await this.imageInfoRepository.savePostMainImageInfo(newImage);
      }),
    );

    return true;
  }
}
