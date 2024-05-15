import { Injectable, NotFoundException } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from '../../infrastructure/posts-schema';
import { CreatePostModel } from '../models/input/posts.input.model';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async createPost(inputModel: CreatePostModel, blogId?: string) {
    if (blogId && !Types.ObjectId.isValid(blogId)) {
      throw new NotFoundException('Invalid blogId');
    }
    const getBlogId = blogId && !Types.ObjectId.isValid(blogId) ? blogId : inputModel.blogId;
    const blog = await this.blogsRepository.findBlog(getBlogId!);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    const newPosts = new this.postModel({
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      createdAt: new Date().toISOString(),
      blogId: new Types.ObjectId(getBlogId),
      blogName: blog.name,
    });

    return await this.postsRepository.createPost(newPosts);
  }
  async updatePost(inputModel: CreatePostModel, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const post = await this.postsRepository.findPost(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const updatedPost = {
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      createdAt: post!.createdAt,
      blogId: new Types.ObjectId(inputModel.blogId),
      blogName: post!.blogName,
    };
    return await this.postsRepository.updatePost(updatedPost, id);
  }
  async deletePost(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    return await this.postsRepository.deletePost(id);
  }
}
