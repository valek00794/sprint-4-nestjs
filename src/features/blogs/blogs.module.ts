import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { BlogsPublicController } from './api/public/blogs.public.controller';
import { BlogsService } from './app/blogs.service';
import { BlogsRepository } from './infrastructure/blogs.repository';
import { BlogsQueryRepository } from './infrastructure/blogs.query-repository';
import { UpdateBlogUseCase } from './app/useCases/updateBlog.useCase';
import { CreateBlogUseCase } from './app/useCases/createBlog.useCase';
import { PostsPublicController } from '../posts/api/public/posts.public.controller';
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
import { CommentsController } from '../comments/api/public/comments.controller';
import { BlogsAdminController } from './api/admin/blogs.admin.controller';
import { Blog } from './infrastructure/blogs.entity';
import { Post } from '../posts/infrastructure/posts.entity';
import { Comment } from '../comments/infrastructure/comments.entity';
import { PostsLike } from '../likes/infrastructure/postslikes.entity';
import { CommentsLike } from '../likes/infrastructure/commentsLikes.entity';
import { Like } from '../likes/infrastructure/likes.entity';
import { BindBlogUseCase } from './app/useCases/bindBlog.useCase';
import { UsersRepository } from '../users/infrastructure/users/users.repository';
import { User } from '../users/infrastructure/users/users.entity';
import { UserEmailConfirmationInfo } from '../users/infrastructure/users/usersEmailConfirmationInfo.entity';
import { UsersRecoveryPasssword } from '../users/infrastructure/users/UsersRecoveryPasssword.entity ';
import { BlogsBloggerController } from './api/blogger/blogs.blogger.controller';
import { DeleteBlogUseCase } from './app/useCases/deleteBlog.useCase';
import { DeletePostUseCase } from '../posts/app/useCases/deletePost.useCase';
import { GetCommentUseCase } from '../comments/app/useCases/getComment.useCase';
import { GetPostUseCase } from '../posts/app/useCases/getPost.useCase';
import { BanInfoRepository } from '../users/infrastructure/banInfo/banInfo.repository';
import { UsersBanInfo } from '../users/infrastructure/banInfo/usersBanInfo.entity';
import { UsersBanInfoForBlogs } from '../users/infrastructure/banInfo/usersBanInfoForBlogs.entity';
import { BanBlogUseCase } from './app/useCases/banBlog.useCase';
import { FileStorageService } from 'src/infrastructure/utils/file-storage.service';
import { ImageStorageService } from './infrastructure/image-storage.service';
import { UploadBlogMainImageUseCase } from './app/useCases/uploadBlogMainImage.userCase';
import { ImageInfoRepository } from './infrastructure/blog-image.repository';
import { BlogWallpaperInfo } from './infrastructure/blog-wallpaper-info.entity';
import { BlogMainImagesInfo } from './infrastructure/blog-main-images-info.entity';
import { UploadBlogWallpaperImageUseCase } from './app/useCases/uploadBlogWallpaperImage.useCase';
import { GetBlogImagesUseCase } from './app/useCases/getBlogImages.userCase';

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
];

const imagesUseCases = [
  UploadBlogMainImageUseCase,
  UploadBlogWallpaperImageUseCase,
  GetBlogImagesUseCase,
];
const postsUseCases = [CreatePostUseCase, UpdatePostUseCase, DeletePostUseCase, GetPostUseCase];
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
      BlogMainImagesInfo,
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
