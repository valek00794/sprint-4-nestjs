import {
  Body,
  Controller,
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
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { CreateCommentInputModel } from 'src/features/comments/api/models/input/comments.input.model';
import { CommentsQueryRepository } from 'src/features/comments/infrastructure/comments.query-repository';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { LikeStatusInputModel } from 'src/features/likes/api/models/likes.input.model';
import { CreateCommentCommand } from 'src/features/comments/app/useCases/createComment.useCase';
import { ChangeLikeStatusCommand } from 'src/features/likes/app/useCases/changeLikeStatus.useCase';
import { LikesParrentNames } from 'src/features/likes/domain/likes.types';
import { PostsService } from '../../app/posts.service';
import { PostsQueryRepository } from '../../infrastructure/posts.query-repository';
import { GetPostCommand } from '../../app/useCases/getPost.useCase';

@Controller(SETTINGS.PATH.posts)
export class PostsPublicController {
  constructor(
    protected postsService: PostsService,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Public()
  @Get()
  async getPosts(@Query() query: SearchQueryParametersType, @Req() req: Request) {
    return await this.postsQueryRepository.getPosts(query, undefined, req.user?.userId, true);
  }

  @Public()
  @Get(':id')
  async getPost(@Param('id') id: string, @Req() req: Request) {
    return await this.commandBus.execute(new GetPostCommand(id, req.user?.userId));
  }

  //переделать
  @UseGuards(AuthBearerGuard)
  @Post(':postId/comments')
  async createCommentForPost(
    @Body() inputModel: CreateCommentInputModel,
    @Param('postId') postId: string,
    @Req() req: Request,
  ) {
    const newCommentId = await this.commandBus.execute(
      new CreateCommentCommand(inputModel, postId, req.user!.userId, req.user!.login),
    );
    const comment = await this.commentsQueryRepository.findCommentById(newCommentId);
    return this.commentsQueryRepository.mapToOutput(comment!);
  }

  @Public()
  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Req() req: Request,
    @Query() query: SearchQueryParametersType,
  ) {
    const numberPostId = Number(postId);
    if (isNaN(numberPostId)) {
      throw new NotFoundException('Post not found');
    }
    const post = await this.postsQueryRepository.findPostById(numberPostId);
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
    const post = await this.postsQueryRepository.findPostById(Number(postId));
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    await this.commandBus.execute(
      new ChangeLikeStatusCommand(postId, LikesParrentNames.Post, req.user!.userId, inputModel),
    );
  }
}
