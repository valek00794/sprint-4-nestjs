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
    const blog = await this.blogsRepository
      .createQueryBuilder('blog')
      .leftJoinAndSelect('blog.blogOwnerInfo', 'blogOwnerInfo')
      .where('blog.id = :id', { id })
      .getOne();

    return blog;
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

  async bindBlog(blog: Blog) {
    return await this.blogsRepository.save(blog);
  }

  async banBlog(id: number): Promise<Blog | null> {
    const blog = await this.blogsRepository.findOne({
      where: { id },
    });
    if (blog) {
      blog.isBanned = true;
      await this.blogsRepository.save(blog);
      return blog;
    } else {
      return null;
    }
  }
  async unBanBlog(id: number): Promise<Blog | null> {
    const blog = await this.blogsRepository.findOne({
      where: { id },
    });
    if (blog) {
      blog.isBanned = false;
      await this.blogsRepository.save(blog);
      return blog;
    } else {
      return null;
    }
  }
}
