import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async deletePost(id: string): Promise<boolean> {
    const postId = Number(id);
    if (isNaN(postId)) {
      throw new NotFoundException('Post not found');
    }
    return await this.postsRepository.deletePost(postId);
  }
}
