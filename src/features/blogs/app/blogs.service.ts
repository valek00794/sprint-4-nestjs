import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../infrastructure/blogs.repository';
import { isValidMongoId } from 'src/features/utils';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}
  async deleteBlog(id: string): Promise<boolean> {
    if (!isValidMongoId(id)) {
      throw new NotFoundException('Invalid ID');
    }
    return await this.blogsRepository.deleteBlog(id);
  }
}
