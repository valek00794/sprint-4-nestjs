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
import { ImageInfo } from 'src/features/blogs/domain/image.types';

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
    let blog;
    if (blogId) {
      blog = await this.blogsQueryRepository.findBlogById(blogId);
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
      qb.where('post.blogId = :blogId', { blogId });
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
      const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(post.likes, userId);
      return this.mapToOutput(post, mapedlikesInfo);
    });

    return new Paginator<PostViewModel[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      count,
      postsItems,
    );
  }

  async findPostById(id: string): Promise<Post | null> {
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

  mapToOutput(
    post: Post,
    extendedLikesInfo?: ExtendedLikesInfo,
    images?: ImageInfo,
  ): PostViewModel {
    const extendedLikesInfoView = extendedLikesInfo
      ? extendedLikesInfo
      : new ExtendedLikesInfo(0, 0, LikeStatus.None, []);
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blog.name,
      createdAt: post.createdAt,
      extendedLikesInfo: extendedLikesInfoView,
      images: images ? images : new ImageInfo([]),
    };
  }
}
