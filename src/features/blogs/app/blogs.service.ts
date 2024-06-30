import { Injectable, NotFoundException } from '@nestjs/common';

import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}
  async deleteBlog(id: string): Promise<boolean> {
    if (isNaN(Number(id))) {
      throw new NotFoundException('Blog not found');
    }
    return await this.blogsRepository.deleteBlog(Number(id));
  }
}
