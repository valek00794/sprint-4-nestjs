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
import { CommandBus } from '@nestjs/cqrs';

import { SETTINGS } from 'src/settings/settings';
import { CommentsQueryRepository } from '../../infrastructure/comments.query-repository';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { CreateCommentInputModel } from '../models/input/comments.input.model';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { UpdateCommentCommand } from '../../app/useCases/updateComment.useCase';
import { DeleteCommentCommand } from '../../app/useCases/deleteComment.useCase';
import { ChangeLikeStatusCommand } from 'src/features/likes/app/useCases/changeLikeStatus.useCase';
import { LikeStatusInputModel } from 'src/features/likes/api/models/likes.input.model';
import { LikesParrentNames } from 'src/features/likes/domain/likes.types';

@Controller(SETTINGS.PATH.comments)
export class CommentsController {
  constructor(
    protected commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}
  @Public()
  @Get(':id')
  async getComment(@Param('id') id: string, @Req() req: Request) {
    const commentId = Number(id);
    if (isNaN(commentId)) {
      throw new NotFoundException('Comment not found');
    }
    return await this.commentsQueryRepository.findCommentById(commentId, Number(req.user?.userId));
  }

  @UseGuards(AuthBearerGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeCommentLikeStatus(
    @Body() inputModel: LikeStatusInputModel,
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    const id = Number(commentId);
    if (isNaN(id)) {
      throw new NotFoundException('Comment not found');
    }
    await this.commentsQueryRepository.findCommentById(id);
    await this.commandBus.execute(
      new ChangeLikeStatusCommand(
        commentId,
        LikesParrentNames.Comment,
        req.user!.userId,
        inputModel,
      ),
    );
  }

  @UseGuards(AuthBearerGuard)
  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateComment(
    @Body() inputModel: CreateCommentInputModel,
    @Param('commentId') commentId: string,
    @Req() req: Request,
  ) {
    await this.commandBus.execute(
      new UpdateCommentCommand(inputModel, commentId, req.user!.userId),
    );
  }
  @UseGuards(AuthBearerGuard)
  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComment(@Param('commentId') commentId: string, @Req() req: Request) {
    await this.commandBus.execute(new DeleteCommentCommand(commentId, req.user!.userId));
  }
}
