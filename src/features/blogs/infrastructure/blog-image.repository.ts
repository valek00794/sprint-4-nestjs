import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ImageType } from '../domain/image.types';
import { BlogMainImagesInfo } from './blog-main-images-info.entity';
import { BlogWallpaperInfo } from './blog-wallpaper-info.entity';

@Injectable()
export class ImageInfoRepository {
  constructor(
    @InjectRepository(BlogWallpaperInfo)
    protected blogWallpaperInfoRepository: Repository<BlogWallpaperInfo>,
    @InjectRepository(BlogMainImagesInfo)
    protected blogMainImagesInfoRepository: Repository<BlogMainImagesInfo>,
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

  public async saveMainImageInfo(image: BlogMainImagesInfo): Promise<BlogMainImagesInfo> {
    return this.blogMainImagesInfoRepository.save(image);
  }

  public async getBlogWallpaperInfo(blogId: string): Promise<BlogWallpaperInfo | null> {
    const result = await this.blogWallpaperInfoRepository.findOne({
      where: { blogId },
    });
    return result ? result : null;
  }

  public async getBlogWMainImagesInfo(blogId: string): Promise<BlogMainImagesInfo[] | null> {
    const result = await this.blogMainImagesInfoRepository.find({
      where: { blogId },
    });
    return result.length ? result : null;
  }

  mapToOutput(wallpaper: BlogWallpaperInfo | BlogMainImagesInfo, wallPaperUrl: string): ImageType {
    return new ImageType(wallPaperUrl, wallpaper.width, wallpaper.height, wallpaper.size);
  }
  // public async deleteAvatarKeyByUserId(userId: User['id']): Promise<UserAvatar> {
  //   return await this.txHost.tx.userAvatar.delete({
  //     where: { userId },
  // }
}
