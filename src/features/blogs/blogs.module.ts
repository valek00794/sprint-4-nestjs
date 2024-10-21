import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogsPublicController } from './api/public/blogs.public.controller';
import { BlogsService } from './app/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { PostsPublicController } from '../posts/api/public/posts.public.controller';
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
import { CommentsController } from '../comments/api/public/comments.controller';
import { BlogsAdminController } from './api/admin/blogs.admin.controller';
import { Blog } from './infrastructure/blogs.entity';
import { Post } from '../posts/infrastructure/posts.entity';
import { Comment } from '../comments/infrastructure/comments.entity';
import { PostsLike } from '../likes/infrastructure/postslikes.entity';
import { CommentsLike } from '../likes/infrastructure/commentsLikes.entity';
import { Like } from '../likes/infrastructure/likes.entity';
import { UsersRepository } from '../users/infrastructure/users/users.repository';
import { User } from '../users/infrastructure/users/users.entity';
import { UserEmailConfirmationInfo } from '../users/infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from '../users/infrastructure/users/UsersRecoveryPasssword.entity ';
import { BlogsBloggerController } from './api/blogger/blogs.blogger.controller';
import { GetCommentUseCase } from '../comments/app/useCases/getComment.useCase';
import { GetPostUseCase } from '../posts/app/useCases/queryBus/getPost.useCase';
import { BanInfoRepository } from '../users/infrastructure/banInfo/banInfo.repository';
import { UsersBanInfo } from '../users/infrastructure/banInfo/usersBanInfo.entity';
import { UsersBanInfoForBlogs } from '../users/infrastructure/banInfo/usersBanInfoForBlogs.entity';
import { FileStorageService } from 'src/infrastructure/utils/file-storage.service';
import { ImageStorageService } from './infrastructure/image-storage.service';
import { ImageInfoRepository } from './infrastructure/blog-image.repository';
import { BlogWallpaperInfo } from './infrastructure/blog-wallpaper-info.entity';
import { BlogMainImageInfo } from './infrastructure/blog-main-images-info.entity';
import { GetBlogImagesUseCase } from './app/useCases/queryBus/getBlogImages.useCase';
import { GetBlogsUseCase } from './app/useCases/queryBus/getBlogs.useCase';
import { PostMainImageInfo } from '../posts/infrastructure/post-main-image.entity';
import { GetPostsUseCase } from '../posts/app/useCases/queryBus/getPosts.useCase';
import { GetPostImagesUseCase } from '../posts/app/useCases/queryBus/getPostImages.useCase';
import { DeletePostUseCase } from '../posts/app/useCases/commandBus/deletePost.useCase';
import { CreatePostUseCase } from '../posts/app/useCases/commandBus/createPost.useCase';
import { UpdatePostUseCase } from '../posts/app/useCases/commandBus/updatePost.useCase';
import { BanBlogUseCase } from './app/useCases/commandBus/banBlog.useCase';
import { UploadBlogMainImageUseCase } from './app/useCases/commandBus/uploadBlogMainImage.useCase';
import { UploadBlogWallpaperImageUseCase } from './app/useCases/commandBus/uploadBlogWallpaperImage.useCase';
import { UploadPostMainImageUseCase } from './app/useCases/commandBus/uploadPostMainImage.useCase';
import { BindBlogUseCase } from './app/useCases/commandBus/bindBlog.useCase';
import { CreateBlogUseCase } from './app/useCases/commandBus/createBlog.useCase';
import { DeleteBlogUseCase } from './app/useCases/commandBus/deleteBlog.useCase';
import { UpdateBlogUseCase } from './app/useCases/commandBus/updateBlog.useCase';

const blogsProviders = [BlogsService, BlogsRepository, BlogsQueryRepository, ImageInfoRepository];
const postsProviders = [PostsService, PostsRepository, PostsQueryRepository];
const usersProviders = [UsersRepository];
const commentsProviders = [CommentsRepository, CommentsQueryRepository];
const banInfoProviders = [BanInfoRepository];
const likesProviders = [LikesRepository, LikesQueryRepository];

const blogsUseCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  BindBlogUseCase,
  DeleteBlogUseCase,
  BanBlogUseCase,
  GetBlogsUseCase,
];

const imagesUseCases = [
  UploadBlogMainImageUseCase,
  UploadBlogWallpaperImageUseCase,
  UploadPostMainImageUseCase,
  GetBlogImagesUseCase,
  GetPostImagesUseCase,
];
const postsUseCases = [
  CreatePostUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  GetPostUseCase,
  GetPostsUseCase,
];
const commentsUseCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  DeleteCommentUseCase,
  GetCommentUseCase,
];
const likesUseCases = [ChangeLikeStatusUseCase];

const services = [FileStorageService, ImageStorageService];

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([
      Blog,
      Post,
      Comment,
      Like,
      PostsLike,
      CommentsLike,
      User,
      UserEmailConfirmationInfo,
      UsersRecoveryPasssword,
      UsersBanInfo,
      UsersBanInfoForBlogs,
      BlogWallpaperInfo,
      BlogMainImageInfo,
      PostMainImageInfo,
    ]),
  ],
  controllers: [
    BlogsPublicController,
    BlogsAdminController,
    BlogsBloggerController,
    PostsPublicController,
    CommentsController,
  ],
  providers: [
    ...blogsProviders,
    ...postsProviders,
    ...commentsProviders,
    ...likesProviders,
    ...blogsUseCases,
    ...postsUseCases,
    ...commentsUseCases,
    ...likesUseCases,
    ...usersProviders,
    ...banInfoProviders,
    ...services,
    ...imagesUseCases,
  ],
})
export class BlogsModule {}
