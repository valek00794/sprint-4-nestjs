import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  HttpStatus,
  UseGuards,
  NotFoundException,
  HttpCode,
  Req,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { validate } from 'class-validator';
import { FileInterceptor } from '@nestjs/platform-express';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { PostsQueryRepository } from 'src/features/posts/infrastructure/posts.query-repository';
import { BlogsService } from '../../app/blogs.service';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';
import { CreateBlogInputModel, CreatePostForBlogModel } from '../models/input/blogs.input.model';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { CommentsQueryRepository } from 'src/features/comments/infrastructure/comments.query-repository';
import { BlogMainFile, BlogWallpaperFile, PostMainFile } from '../models/input/image.input.model';
import { FieldError } from 'src/infrastructure/exception.filter.types';
import { GetBlogImagesQuery } from '../../app/useCases/queryBus/getBlogImages.useCase';
import { GetBlogsQuery } from '../../app/useCases/queryBus/getBlogs.useCase';
import { GetPostsQuery } from '../../../posts/app/useCases/queryBus/getPosts.useCase';
import { GetPostImagesQuery } from 'src/features/posts/app/useCases/queryBus/getPostImages.useCase';
import { CreatePostCommand } from 'src/features/posts/app/useCases/commandBus/createPost.useCase';
import { UpdatePostCommand } from 'src/features/posts/app/useCases/commandBus/updatePost.useCase';
import { DeletePostCommand } from 'src/features/posts/app/useCases/commandBus/deletePost.useCase';
import { CreateBlogCommand } from '../../app/useCases/commandBus/createBlog.useCase';
import { DeleteBlogCommand } from '../../app/useCases/commandBus/deleteBlog.useCase';
import { UpdateBlogCommand } from '../../app/useCases/commandBus/updateBlog.useCase';
import { UploadBlogMainImageCommand } from '../../app/useCases/commandBus/uploadBlogMainImage.useCase';
import { UploadBlogWallpaperImageCommand } from '../../app/useCases/commandBus/uploadBlogWallpaperImage.useCase';
import { UploadPostMainImageCommand } from '../../app/useCases/commandBus/uploadPostMainImage.useCase';

@UseGuards(AuthBearerGuard)
@Controller(SETTINGS.PATH.blogsBlogger)
export class BlogsBloggerController {
  constructor(
    protected blogsService: BlogsService,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getBlogs(@Req() req: Request, @Query() query?: SearchQueryParametersType) {
    return await this.queryBus.execute(
      new GetBlogsQuery(query, false, req.user?.userId, req.user?.userId),
    );
  }

  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputModel, @Req() req: Request) {
    const createdBlog = await this.commandBus.execute(
      new CreateBlogCommand(inputModel, req.user?.userId),
    );
    return this.blogsQueryRepository.mapToOutput(createdBlog);
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBlog(
    @Body() inputModel: CreateBlogInputModel,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(new UpdateBlogCommand(inputModel, id, req.user?.userId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlog(@Param('id') id: string, @Req() req: Request) {
    const deleteResult = await this.commandBus.execute(new DeleteBlogCommand(id, req.user?.userId));
    if (!deleteResult) {
      throw new NotFoundException('Blog not found');
    }
    return deleteResult;
  }

  @Get(':blogId/posts')
  @HttpCode(HttpStatus.OK)
  async getPostsOfBlog(
    @Param('blogId') blogId: string,
    @Req() req: Request,
    @Query() query?: SearchQueryParametersType,
  ) {
    const posts = await this.queryBus.execute(
      new GetPostsQuery(query, blogId, req.user!.userId, false),
    );
    if (!posts) {
      throw new NotFoundException('Blog not found');
    }
    return posts;
  }

  @Post(':blogId/posts')
  @HttpCode(HttpStatus.CREATED)
  async createPostForBlog(
    @Body() inputModel: CreatePostForBlogModel,
    @Param('blogId') blogId: string,
    @Req() req: Request,
  ) {
    const createdPost = await this.commandBus.execute(
      new CreatePostCommand(inputModel, blogId, req.user?.userId),
    );
    return this.postsQueryRepository.mapToOutput(createdPost);
  }

  @Put(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(
    @Body() inputModel: CreatePostForBlogModel,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(
      new UpdatePostCommand(inputModel, postId, blogId, req.user?.userId),
    );
  }

  @Delete(':blogId/posts/:postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(new DeletePostCommand(postId, blogId, req.user?.userId));
  }

  @Get('comments')
  async getComments(@Req() req: Request, @Query() query?: SearchQueryParametersType) {
    return await this.commentsQueryRepository.getComments(undefined, query, req.user!.userId);
  }

  @Post(':blogId/images/wallpaper')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadBlogWallpaper(
    @UploadedFile() file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Req() req: Request,
  ) {
    const blogWallpaperFile = new BlogWallpaperFile();
    blogWallpaperFile.file = file;
    const errors = await validate(blogWallpaperFile);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((error) => new FieldError(error.constraints!['isValidFile'], error.property)),
      );
    }
    await this.commandBus.execute(
      new UploadBlogWallpaperImageCommand(file, blogId, req.user!.userId),
    );
    return await this.queryBus.execute(new GetBlogImagesQuery(blogId));
  }

  @Post(':blogId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadBlogMainImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Req() req: Request,
  ) {
    const blogMainFile = new BlogMainFile();
    blogMainFile.file = file;
    const errors = await validate(blogMainFile);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((error) => new FieldError(error.constraints!['isValidFile'], error.property)),
      );
    }
    await this.commandBus.execute(new UploadBlogMainImageCommand(file, blogId, req.user!.userId));
    return await this.queryBus.execute(new GetBlogImagesQuery(blogId));
  }

  @Post(':blogId/posts/:postId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async uploadPostMainImage(
    @UploadedFile() file: Express.Multer.File,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    const postMainFile = new PostMainFile();
    postMainFile.file = file;
    const errors = await validate(postMainFile);
    if (errors.length > 0) {
      throw new BadRequestException(
        errors.map((error) => new FieldError(error.constraints!['isValidFile'], error.property)),
      );
    }
    await this.commandBus.execute(
      new UploadPostMainImageCommand(file, blogId, postId, req.user!.userId),
    );
    return await this.queryBus.execute(new GetPostImagesQuery(postId));
  }
}
