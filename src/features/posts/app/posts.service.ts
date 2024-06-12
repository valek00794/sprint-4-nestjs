import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async deletePost(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid post id');
    }
    return await this.postsRepository.deletePost(id);
  }
}
