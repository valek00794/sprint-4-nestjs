import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from './posts.entity';
import { PostType } from '../domain/posts/posts.types';

@Injectable()
export class PostsRepository {
  constructor(@InjectRepository(Post) protected postsRepository: Repository<Post>) {}

  async createPost(newPosts: PostType) {
    const post = await this.postsRepository.save(newPosts);
    return this.findPostbyId(post.id);
  }
  async findPostbyId(id: string): Promise<Post | null> {
    return await this.postsRepository.findOne({
      where: [{ id: id }],
      relations: {
        blog: true,
      },
    });
  }
  async updatePost(updatedPost: PostType, postId: string): Promise<Post | null> {
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
  async deletePost(postId: string): Promise<boolean> {
    const result = await this.postsRepository.delete({ id: postId });
    return result.affected === 1 ? true : false;
  }
}
