import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { Post, PostDocument } from './posts-schema';

@Injectable()
export class PostsRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async createPost(newPosts: PostDocument) {
    const post = new this.postModel(newPosts);
    await post.save();
    return post;
  }
  async findPost(id: string): Promise<PostDocument | null> {
    return await this.postModel.findById(id);
  }
  async updatePost(updatedPost: Post, id: string): Promise<boolean> {
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
