import { Injectable } from '@nestjs/common';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { PostEntity } from '../infrastructure/posts.entity';
@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async deletePost(postId: string): Promise<PostEntity | null> {
    if (isNaN(Number(postId))) {
      return null;
    }
    return await this.postsRepository.deletePost(postId);
  }
}
