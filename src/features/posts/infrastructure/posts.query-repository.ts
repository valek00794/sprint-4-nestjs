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
  ): Promise<null | Paginator<PostViewModel[] | Post[]>> {
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

    const sanitizationQuery = getSanitizationQuery(queryString);
    const offset = (sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize;
    const qb = this.postsRepository.createQueryBuilder('post');
    if (blogId) {
      qb.where('post.blogId = :blogId', { blogId: Number(blogId) });
    }
    const query = qb
      .select([
        'post.id',
        'post.title',
        'post.shortDescription',
        'post.content',
        'post.blogId',
        'post.createdAt',
        'blog.name',
      ])
      .leftJoinAndSelect('post.blog', 'blog')
      .leftJoinAndSelect('post.likes', 'like')
      .leftJoinAndSelect('like.author', 'author')
      .orderBy(
        `${sanitizationQuery.sortBy && sanitizationQuery.sortBy === 'blogName' ? 'blog.name' : 'post.' + sanitizationQuery.sortBy}`,
        sanitizationQuery.sortDirection,
      )
      .offset(offset)
      .limit(sanitizationQuery.pageSize)
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
      Number(count),
      postsItems,
    );
  }

  async findPostById(id: number, userId?: number): Promise<PostViewModel | null> {
    const post = await this.postsRepository.findOne({
      where: [{ id }],
      relations: ['blog', 'likes.author'],
    });
    if (post) {
      const mapedlikesInfo = this.likesQueryRepository.mapExtendedLikesInfo(
        post.likes,
        Number(userId),
      );
      return this.mapToOutput(post, mapedlikesInfo);
    }
    return null;
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
