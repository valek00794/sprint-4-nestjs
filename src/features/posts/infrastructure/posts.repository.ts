import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Post, PostDocument } from './posts.schema';
import { CreatePostModel } from '../api/models/input/posts.input.model';
import { CreatePostForBlogModel } from 'src/features/blogs/api/models/input/blogs.input.model';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(newPosts: CreatePostModel | CreatePostForBlogModel) {
    const post = new this.postModel(newPosts);
    await post.save();
    return post;
  }
  async findPost(id: string): Promise<PostDocument | null> {
    return await this.postModel.findById(id);
  }
  async updatePost(updatedPost: CreatePostModel, id: string): Promise<boolean> {
    const updatedResult = await this.postModel.findByIdAndUpdate(id, updatedPost, {
      new: true,
    });
    return updatedResult ? true : false;
  }
  async deletePost(id: string): Promise<boolean> {
    const deleteResult = await this.postModel.findByIdAndDelete(id);
    return deleteResult ? true : false;
  }
}
