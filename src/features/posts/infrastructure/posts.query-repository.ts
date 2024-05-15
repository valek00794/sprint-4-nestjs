import { Injectable, NotFoundException } from '@nestjs/common';
import { Post, PostDocument } from './Posts-schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { PostView } from '../api/models/output/posts.output.model';

@Injectable()
export class PostsQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getPosts(query?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(query);
    const findOptions =
      sanitizationQuery.searchNameTerm !== null
        ? { name: { $regex: sanitizationQuery.searchNameTerm, $options: 'i' } }
        : {};

    const posts = await this.postModel
      .find(findOptions)
      .sort({ [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection })
      .skip((sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize)
      .limit(sanitizationQuery.pageSize);

    const PostsCount = await this.postModel.countDocuments(findOptions);

    return new Paginator<PostView[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      PostsCount,
      posts.map((post) => this.mapToOutput(post)),
    );
  }

  async findPost(id: string): Promise<PostView> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const post = await this.postModel.findById(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return this.mapToOutput(post);
  }
  mapToOutput(post: PostDocument): PostView {
    return new PostView(
      post._id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
    );
  }
}
