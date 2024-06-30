import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { BlogsPublicController } from './api/public/blogs.public.controller';
import { BlogsService } from './app/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { UpdateBlogUseCase } from './app/useCases/updateBlog.useCase';
import { CreateBlogUseCase } from './app/useCases/createBlog.useCase';
import { PostsController } from '../posts/api/posts.controller';
import { UpdatePostUseCase } from '../posts/app/useCases/updatePost.useCase';
import { CreatePostUseCase } from '../posts/app/useCases/createPost.useCase';
import { PostsQueryRepository } from '../posts/infrastructure/posts.query-repository';
import { PostsRepository } from '../posts/infrastructure/posts.repository';
import { PostsService } from '../posts/app/posts.service';
import { CommentsRepository } from '../comments/infrastructure/comments.repository';
import { CommentsQueryRepository } from '../comments/infrastructure/comments.query-repository';
import { LikesRepository } from '../likes/infrastructure/likeS.repository';
import { LikesQueryRepository } from '../likes/infrastructure/likes.query-repository';
import { CreateCommentUseCase } from '../comments/app/useCases/createComment.useCase';
import { UpdateCommentUseCase } from '../comments/app/useCases/updateComment.useCase';
import { DeleteCommentUseCase } from '../comments/app/useCases/deleteComment.useCase';
import { ChangeLikeStatusUseCase } from '../likes/app/useCases/changeLikeStatus.useCase';
import { CommentsController } from '../comments/api/comments.controller';
import { BlogsAdminController } from './api/admin/blogs.admin.controller';

const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository];
const postsProviders = [PostsService, PostsRepository, PostsQueryRepository];
const commentsProviders = [CommentsRepository, CommentsQueryRepository];
const likesProviders = [LikesRepository, LikesQueryRepository];

const blogsUseCases = [CreateBlogUseCase, UpdateBlogUseCase];
const postsUseCases = [CreatePostUseCase, UpdatePostUseCase];
const commentsUseCases = [CreateCommentUseCase, UpdateCommentUseCase, DeleteCommentUseCase];
const likesUseCases = [ChangeLikeStatusUseCase];

@Module({
  imports: [CqrsModule],
  controllers: [BlogsPublicController, BlogsAdminController, PostsController, CommentsController],
  providers: [
    ...blogsProviders,
    ...postsProviders,
    ...commentsProviders,
    ...likesProviders,
    ...blogsUseCases,
    ...postsUseCases,
    ...commentsUseCases,
    ...likesUseCases,
  ],
})
export class BlogsModule {}
