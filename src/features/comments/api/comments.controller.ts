import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { SETTINGS } from 'src/settings/settings';
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { LikeStatusInputModel } from 'src/features/likes/api/models/likes.input.model';
import { LikesService } from 'src/features/likes/app/likes.service';
import { CreateCommentModel } from './models/input/comments.input.model';
import { CommentsService } from '../app/comments.service';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';

@Controller(SETTINGS.PATH.comments)
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesService: LikesService,
    protected commentsService: CommentsService,
  ) {}
  @Public()
  @Get(':id')
  async getComment(@Param('id') id: string, @Req() req: Request) {
    return await this.commentsQueryRepository.findComment(id, req.user?.userId);
  }

  @UseGuards(AuthBearerGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeCommentLikeStatus(
    @Body() inputModel: LikeStatusInputModel,
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    const comment = await this.commentsQueryRepository.findComment(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return await this.likesService.changeLikeStatus(
      commentId,
      inputModel,
      req.user!.userId,
      req.user!.login,
    );
  }

  @UseGuards(AuthBearerGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async createCommentForPost(
    @Body() inputModel: CreateCommentModel,
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    const comment = await this.commentsQueryRepository.findComment(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.commentsService.updateComment(
      inputModel,
      comment,
      req.user!.userId,
      req.user!.login,
    );
  }

  @UseGuards(AuthBearerGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: Request) {
    const comment = await this.commentsQueryRepository.findComment(commentId);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    await this.commentsService.deleteComment(comment, req.user!.userId, req.user!.login);
  }
}
