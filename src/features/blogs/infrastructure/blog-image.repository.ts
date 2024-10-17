import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogImage } from './blog-image.entity';
import { BlogImageType } from '../domain/blogs.types';
import { Repository } from 'typeorm';

@Injectable()
export class BlogImageRepository {
  constructor(@InjectRepository(BlogImage) protected blogsImageRepository: Repository<BlogImage>) {}
  public async setBlogImage(blogId: number, type: BlogImageType, imageKey: string) {
    const existingPhoto = await this.blogsImageRepository.findOne({
      where: { blogId, type },
    });
    if (existingPhoto) {
      existingPhoto.updatedAt = new Date().toISOString();
      existingPhoto.key = imageKey;
      return await this.blogsImageRepository.save(existingPhoto);
    } else {
      const newPhoto = this.blogsImageRepository.create({
        blogId,
        type,
        key: imageKey,
      });
      return await this.blogsImageRepository.save(newPhoto);
    }
  }
  // public async getAvatarKeyByUserId(userId: User['id']): Promise<UserAvatar['avatarKey'] | null> {
  //   const result = await this.txHost.tx.userAvatar.findUnique({
  //     where: { userId },
  //     select: { avatarKey: true },
  //   });
  //   return result ? result.avatarKey : null;
  // }

  // public async deleteAvatarKeyByUserId(userId: User['id']): Promise<UserAvatar> {
  //   return await this.txHost.tx.userAvatar.delete({
  //     where: { userId },
  //   });
  // }
}
