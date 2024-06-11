import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from './posts.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { PostView } from '../api/models/output/posts.output.model';
import { ExtendedLikesInfo, LikeStatus } from 'src/features/likes/domain/likes.types';
import { Blog, BlogDocument } from 'src/features/blogs/infrastructure/blogs.schema';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    protected likesQueryRepository: LikesQueryRepository,
  ) {}

  async getPosts(
    query?: SearchQueryParametersType,
    blogId?: string,
    userId?: string,
  ): Promise<false | Paginator<PostView[]>> {
    if (blogId && !Types.ObjectId.isValid(blogId)) {
      return false;
    }
    let blog;
    if (blogId) {
      blog = await this.blogModel.findById(blogId);
    }
    if (!blog && blogId) {
      return false;
    }
    const sanitizationQuery = getSanitizationQuery(query);
    let findOptions: Record<string, any> = {};

    if (sanitizationQuery.searchNameTerm !== null) {
      findOptions = {
        name: { $regex: sanitizationQuery.searchNameTerm, $options: 'i' },
      };
    }

    if (blogId) {
      if (findOptions.hasOwnProperty('name')) {
        findOptions = {
          $and: [findOptions, { blogId: new Types.ObjectId(blogId) }],
        };
      } else {
        findOptions.blogId = new Types.ObjectId(blogId);
      }
    }

    const posts = await this.postModel
      .find(findOptions)
      .sort({ [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection })
      .skip((sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize)
      .limit(sanitizationQuery.pageSize);

    const postsCount = await this.postModel.countDocuments(findOptions);

    const postsItems = await Promise.all(
      posts.map(async (post) => {
        const likesInfo = await this.likesQueryRepository.getLikesInfo(post.id);
        const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(likesInfo, userId);
        return this.mapToOutput(post, mapedlikesInfo);
      }),
    );

    return new Paginator<PostView[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      postsCount,
      postsItems,
    );
  }

  async findPost(id: string, userId?: string): Promise<PostView | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const post = await this.postModel.findById(id);
    if (!post) {
      return null;
    }

    const likesInfo = await this.likesQueryRepository.getLikesInfo(post.id);
    const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(likesInfo, userId);
    return this.mapToOutput(post, mapedlikesInfo);
  }
  mapToOutput(post: PostDocument, extendedLikesInfo?: ExtendedLikesInfo): PostView {
    const extendedLikesInfoView = extendedLikesInfo
      ? extendedLikesInfo
      : new ExtendedLikesInfo(0, 0, LikeStatus.None, []);
    return new PostView(
      post._id,
      post.title,
      post.shortDescription,
      post.content,
      post.blogId,
      post.blogName,
      post.createdAt,
      extendedLikesInfoView,
    );
  }
}
