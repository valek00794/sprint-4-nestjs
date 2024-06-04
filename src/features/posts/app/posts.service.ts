import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { PostsRepository } from '../infrastructure/posts.repository';
import { Post, PostDocument } from '../infrastructure/posts.schema';
import { CreatePostModel } from '../api/models/input/posts.input.model';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async createPost(inputModel: CreatePostModel, blogId?: string): Promise<PostDocument> {
    const getBlogId = blogId && Types.ObjectId.isValid(blogId) ? blogId : inputModel.blogId;
    const blog = await this.blogsRepository.findBlog(getBlogId);
    const newPosts = new this.postModel({
      title: inputModel.title,
      shortDescription: inputModel.shortDescription,
      content: inputModel.content,
      createdAt: new Date().toISOString(),
      blogId: new Types.ObjectId(getBlogId),
      blogName: blog!.name,
    });

    return await this.postsRepository.createPost(newPosts);
  }

  async updatePost(inputModel: CreatePostModel, id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid post id');
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
      throw new NotFoundException('Invalid post id');
    }
    return await this.postsRepository.deletePost(id);
  }
}
