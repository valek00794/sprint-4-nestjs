import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { PostViewModel } from '../api/models/output/posts.output.model';
import { ExtendedLikesInfo, LikeStatus } from 'src/features/likes/domain/likes.types';
import { LikesQueryRepository } from 'src/features/likes/infrastructure/likes.query-repository';
import { Post } from './posts.entity';
import { BlogsQueryRepository } from 'src/features/blogs/infrastructure/blogs.query-repository';
import { Blog } from 'src/features/blogs/infrastructure/blogs.entity';

@Injectable()
export class PostsQueryRepository {
  constructor(
    protected likesQueryRepository: LikesQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
    @InjectRepository(Blog) protected blogsRepository: Repository<Blog>,
    @InjectRepository(Post) protected postsRepository: Repository<Post>,
  ) {}

  async getPosts(
    queryString?: SearchQueryParametersType,
    blogId?: string,
    userId?: string,
    withoutBanned?: boolean,
  ): Promise<null | Paginator<PostViewModel[]>> {
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

    if (blog && withoutBanned && blog.isBanned) {
      return null;
    }

    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const qb = this.postsRepository.createQueryBuilder('post');
    if (blogId) {
      qb.where('post.blogId = :blogId', { blogId: Number(blogId) });
    }
    const query = qb
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('post.likes', 'likes')
      .leftJoinAndSelect('likes.author', 'author')
      .orderBy(
        sanitizationQuery.sortBy && sanitizationQuery.sortBy === 'blogName'
          ? 'blog.name'
          : `post.${sanitizationQuery.sortBy}`,
        sanitizationQuery.sortDirection,
      )
      .skip(offset)
      .take(sanitizationQuery.pageSize)
      .getManyAndCount();

    const [posts, count] = await query;
    const postsItems = posts.map((post) => {
      const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(
        post.likes,
        Number(userId),
      );
      return this.mapToOutput(post, mapedlikesInfo);
    });

    return new Paginator<PostViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      count,
      postsItems,
    );
  }

  async findPostById(id: number): Promise<Post | null> {
    const post = await this.postsRepository.findOne({
      where: [{ id, blog: { isBanned: false } }],
      relations: {
        blog: true,
        likes: {
          author: { banInfo: true },
        },
      },
    });
    if (!post) {
      return null;
    }
    return post;
  }

  mapToOutput(post: Post, extendedLikesInfo?: ExtendedLikesInfo): PostViewModel {
    const extendedLikesInfoView = extendedLikesInfo
      ? extendedLikesInfo
      : new ExtendedLikesInfo(0, 0, LikeStatus.None, []);
    return {
      id: post.id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId.toString(),
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: extendedLikesInfoView,
    };
  }
}
