import { Injectable } from '@nestjs/common';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async deletePost(id: string): Promise<boolean> {
    return await this.postsRepository.deletePost(id);
  }
}
