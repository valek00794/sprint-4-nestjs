import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async deletePost(postId: string): Promise<boolean> {
    if (isNaN(Number(postId))) {
      throw new NotFoundException('Post not found');
    }
    return await this.postsRepository.deletePost(postId);
  }
}
