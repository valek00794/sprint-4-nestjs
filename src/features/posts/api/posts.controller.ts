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
} from '@nestjs/common';
import { Request } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { PostsQueryRepository } from '../infrastructure/posts.query-repository';
import { PostsService } from '../app/posts.service';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { AuthBasicGuard } from 'src/infrastructure/guards/auth-basic.guard';
import { CreateCommentModel } from 'src/features/comments/api/models/input/comments.input.model';
import { CommentsService } from 'src/features/comments/app/comments.service';
import { CommentsQueryRepository } from 'src/features/comments/infrastructure/comments.query-repository';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { LikeStatusInputModel } from 'src/features/likes/api/models/likes.input.model';
import { LikesService } from 'src/features/likes/app/likes.service';
import { CreatePostModel } from './models/input/posts.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreatePostCommand } from '../app/useCases/createPost.useCase';
import { UpdatePostCommand } from '../app/useCases/updatePost.useCase';

@Controller(SETTINGS.PATH.posts)
export class PostsController {
  constructor(
    protected postsService: PostsService,
    protected commentsService: CommentsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesService: LikesService,
    private commandBus: CommandBus,
  ) {}
  @Public()
  @UseGuards(AuthBasicGuard)
  @Post()
  async createPost(@Body() inputModel: CreatePostModel) {
    const createdPost = await this.commandBus.execute(new CreatePostCommand(inputModel));
    return this.postsQueryRepository.mapToOutput(createdPost);
  }
  @Public()
  @Get()
  async getPosts(@Query() query: SearchQueryParametersType, @Req() req: Request) {
    return await this.postsQueryRepository.getPosts(query, undefined, req.user?.userId);
  }
  @Public()
  @Get(':id')
  async getPost(@Param('id') id: string, @Req() req: Request) {
    const post = await this.postsQueryRepository.findPost(id, req.user?.userId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }
  @Public()
  @UseGuards(AuthBasicGuard)
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePost(@Body() inputModel: CreatePostModel, @Param('id') id: string) {
    await this.commandBus.execute(new UpdatePostCommand(inputModel, id));
  }
  @Public()
  @UseGuards(AuthBasicGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string) {
    const deleteResult = await this.postsService.deletePost(id);
    if (!deleteResult) {
      throw new NotFoundException('Post not found');
    }
  }
  @UseGuards(AuthBearerGuard)
  @Post(':postId/comments')
  async createCommentForPost(
    @Body() inputModel: CreateCommentModel,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.createComment(
      inputModel,
      postId,
      req.user!.userId,
      req.user!.login,
    );
    return this.commentsQueryRepository.mapToOutput(comment);
  }

  @Public()
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Req() req: Request,
    @Query() query: SearchQueryParametersType,
  ) {
    const post = await this.postsQueryRepository.findPost(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    const comments = await this.commentsQueryRepository.getComments(
      postId,
      query,
      req.user?.userId,
    );
    return comments;
  }

  @UseGuards(AuthBearerGuard)
  @Put(':postId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeCommentLikeStatus(
    @Body() inputModel: LikeStatusInputModel,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    const post = await this.postsQueryRepository.findPost(postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.likesService.changeLikeStatus(postId, inputModel, req.user!.userId, req.user!.login);
  }
}
