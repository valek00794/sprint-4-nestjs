import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Blog } from './blogs.entity';
import { BlogType } from '../domain/blogs.types';

@Injectable()
export class BlogsRepository {
  constructor(@InjectRepository(Blog) protected blogsRepository: Repository<Blog>) {}

  async createBlog(newBlog: BlogType) {
    return await this.blogsRepository.save(newBlog);
  }
  async findBlogById(id: number): Promise<Blog | null> {
    return await this.blogsRepository.findOne({
      where: [{ id: id }],
    });
  }
  async updateBlog(updatedBlog: BlogType, id: number): Promise<Blog | null> {
    const blog = await this.blogsRepository.findOne({
      where: { id },
    });
    if (blog) {
      blog.createdAt = updatedBlog.createdAt;
      blog.description = updatedBlog.description;
      blog.isMembership = updatedBlog.isMembership;
      blog.name = updatedBlog.name;
      blog.websiteUrl = updatedBlog.websiteUrl;

      await this.blogsRepository.save(blog);
      return blog;
    } else {
      return null;
    }
  }
  async deleteBlog(id: number): Promise<boolean> {
    const result = await this.blogsRepository.delete({ id });
    return result.affected === 1 ? true : false;
  }
}
