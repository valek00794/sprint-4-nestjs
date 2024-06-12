import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';

import { BlogsRepository } from '../infrastructure/blogs.repository';

@Injectable()
export class BlogsService {
  constructor(protected blogsRepository: BlogsRepository) {}
  async deleteBlog(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    return await this.blogsRepository.deleteBlog(id);
  }
}
