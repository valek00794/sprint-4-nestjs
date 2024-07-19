import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { PostView } from '../api/models/output/posts.output.model';
import {
  ExtendedLikesInfo,
  LikeStatus,
  LikesParrentNames,
} from 'src/features/likes/domain/likes.types';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';
import { PostEntity } from './posts.entity';
import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected likesQueryRepository: LikesQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  async getPosts(
    query?: SearchQueryParametersType,
    blogId?: string,
    userId?: string,
  ): Promise<null | Paginator<PostView[]>> {
    if (blogId && isNaN(Number(blogId))) {
      return null;
    }
    let blog;
    if (blogId) {
      blog = await this.blogsQueryRepository.findBlogById(Number(blogId));
    }
    if (!blog && blogId) {
      return null;
    }
    const sanitizationQuery = getSanitizationQuery(query);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const queryString = `
      SELECT 
        b."Name" as "blogName", 
        p."Id" as "id", 
        p."Title" as "title", 
        p."ShortDescription" as "shortDescription", 
        p."Content" as "content", 
        p."BlogId" as "blogId", 
        p."CreatedAt" as "createdAt"
      FROM "posts" p
      JOIN "blogs" b ON p."BlogId" = b."Id"
      ${blogId ? `WHERE p."BlogId" = ${blogId}` : ''}
      ORDER BY "${sanitizationQuery.sortBy}"  ${sanitizationQuery.sortDirection}
      LIMIT ${sanitizationQuery.pageSize} 
      OFFSET ${offset};
    `;
    const posts = await this.dataSource.query<PostEntity[]>(queryString);
    const countQuery = `
      SELECT COUNT(*)
      FROM "posts"
      ${blogId ? `WHERE "BlogId" = ${blogId}` : ''}
    `;
    const postsCount = await this.dataSource.query(countQuery);
    const postsItems = await Promise.all(
      posts.map(async (post) => {
        const likesInfo = await this.likesQueryRepository.getLikesInfo(
          post.id!,
          LikesParrentNames.Post,
        );
        const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(
          likesInfo,
          Number(userId),
        );
        return this.mapToOutput(post, mapedlikesInfo);
      }),
    );

    return new Paginator<PostView[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      Number(postsCount[0]?.count || 0),
      postsItems,
    );
  }

  async findPost(id: string, userId?: string): Promise<PostView | null> {
    if (isNaN(Number(id))) {
      return null;
    }
    const query = `
      SELECT 
        b."Name" as "blogName", 
        p."Id" as "id", 
        p."Title" as "title", 
        p."ShortDescription" as "shortDescription", 
        p."Content" as "content", 
        p."BlogId" as "blogId", 
        p."CreatedAt" as "createdAt"
      FROM "posts" p
      JOIN "blogs" b ON p."BlogId" = b."Id"
      WHERE p."Id" = $1;
    `;
    const post = await this.dataSource.query(query, [id]);
    if (post.length !== 0) {
      const likesInfo = await this.likesQueryRepository.getLikesInfo(
        post[0].id,
        LikesParrentNames.Post,
      );
      const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(
        likesInfo,
        Number(userId),
      );
      return this.mapToOutput(post[0], mapedlikesInfo);
    }
    return null;
  }
  mapToOutput(post: PostEntity, extendedLikesInfo?: ExtendedLikesInfo): PostView {
    const extendedLikesInfoView = extendedLikesInfo
      ? extendedLikesInfo
      : new ExtendedLikesInfo(0, 0, LikeStatus.None, []);
    return new PostView(
      post.id!.toString(),
      post.title,
      post.shortDescription,
      post.content,
      post.blogId.toString(),
      post.blogName,
      post.createdAt,
      extendedLikesInfoView,
    );
  }
}
