import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageType } from '../domain/image.types';
import { BlogMainImageInfo } from './blog-main-images-info.entity';
import { BlogWallpaperInfo } from './blog-wallpaper-info.entity';
import { PostMainImageInfo } from 'src/features/posts/infrastructure/post-main-image.entity';

@Injectable()
export class ImageInfoRepository {
  constructor(
    @InjectRepository(BlogWallpaperInfo)
    protected blogWallpaperInfoRepository: Repository<BlogWallpaperInfo>,
    @InjectRepository(BlogMainImageInfo)
    protected blogMainImagesInfoRepository: Repository<BlogMainImageInfo>,
    @InjectRepository(PostMainImageInfo)
    protected postMainImagesInfoRepository: Repository<PostMainImageInfo>,
  ) {}
  public async saveWallpaperImageInfo(
    blogId: string,
    imageKey: string,
    width: number,
    height: number,
    size: number,
  ) {
    const existingPhoto = await this.blogWallpaperInfoRepository.findOne({
      where: { blogId },
    });
    if (existingPhoto) {
      existingPhoto.key = imageKey;
      existingPhoto.width = width;
      existingPhoto.height = height;
      existingPhoto.size = size;
      //existingPhoto.createdAt = new Date().toISOString();
      return await this.blogWallpaperInfoRepository.save(existingPhoto);
    } else {
      const newPhoto = this.blogWallpaperInfoRepository.create({
        blogId,
        key: imageKey,
        width,
        height,
        size,
      });
      return await this.blogWallpaperInfoRepository.save(newPhoto);
    }
  }

  public async saveBlogMainImageInfo(image: BlogMainImageInfo): Promise<BlogMainImageInfo> {
    return this.blogMainImagesInfoRepository.save(image);
  }

  public async getBlogWallpaperInfo(blogId: string): Promise<BlogWallpaperInfo | null> {
    const result = await this.blogWallpaperInfoRepository.findOne({
      where: { blogId },
    });
    return result ? result : null;
  }

  public async getBlogWMainImagesInfo(blogId: string): Promise<BlogMainImageInfo[] | null> {
    const result = await this.blogMainImagesInfoRepository.find({
      where: { blogId },
    });
    return result.length ? result : null;
  }

  public async savePostMainImageInfo(image: PostMainImageInfo): Promise<PostMainImageInfo> {
    return this.postMainImagesInfoRepository.save(image);
  }

  public async getPostWMainImagesInfo(postId: string): Promise<PostMainImageInfo[] | null> {
    const result = await this.postMainImagesInfoRepository.find({
      where: { postId },
    });
    return result.length ? result : null;
  }

  mapToOutput(
    wallpaper: BlogWallpaperInfo | BlogMainImageInfo | PostMainImageInfo,
    wallPaperUrl: string,
  ): ImageType {
    return new ImageType(wallPaperUrl, wallpaper.width, wallpaper.height, wallpaper.size);
  }
  // public async deleteAvatarKeyByUserId(userId: User['id']): Promise<UserAvatar> {
  //   return await this.txHost.tx.userAvatar.delete({
  //     where: { userId },
  // }
}
