import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { Post } from './posts.entity';
import { PostType } from '../domain/posts/posts.types';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectRepository(Post) protected postsRepository: Repository<Post>,
  ) {}

  async createPost(newPosts: PostType) {
    const post = await this.postsRepository.save(newPosts);
    return this.findPostbyId(post.id);
  }
  async findPostbyId(id: number): Promise<Post | null> {
    return await this.postsRepository.findOne({
      where: [{ id: id }],
      relations: {
        blog: true,
      },
    });
  }
  async updatePost(updatedPost: PostType, postId: number): Promise<Post | null> {
    const post = await this.postsRepository.findOne({
      where: { id: postId },
    });
    if (post) {
      post.createdAt = updatedPost.createdAt;
      post.shortDescription = updatedPost.shortDescription;
      post.blogId = updatedPost.blogId;
      post.content = updatedPost.content;
      post.title = updatedPost.title;

      await this.postsRepository.save(post);
      return post;
    } else {
      return null;
    }
  }
  async deletePost(postId: number): Promise<boolean> {
    const result = await this.postsRepository.delete({ id: postId });
    return result.affected === 1 ? true : false;
  }
}
