import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { isValidMongoId } from 'src/features/utils';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async deletePost(id: string): Promise<boolean> {
    if (!isValidMongoId(id)) {
      throw new NotFoundException('Invalid post id');
    }
    return await this.postsRepository.deletePost(id);
  }
}
