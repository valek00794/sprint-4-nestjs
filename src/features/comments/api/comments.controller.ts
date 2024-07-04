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
import { CommentsQueryRepository } from '../infrastructure/comments.query-repository';
import { AuthBearerGuard } from 'src/infrastructure/guards/auth-bearer.guards';
import { LikeStatusInputModel } from 'src/features/likes/api/models/likes.input.model';
import { CreateCommentInputModel } from './models/input/comments.input.model';
import { Public } from 'src/infrastructure/decorators/transform/public.decorator';
import { UpdateCommentCommand } from '../app/useCases/updateComment.useCase';
import { DeleteCommentCommand } from '../app/useCases/deleteComment.useCase';
import { ChangeLikeStatusCommand } from 'src/features/likes/app/useCases/changeLikeStatus.useCase';

@Controller(SETTINGS.PATH.comments)
export class CommentsController {
  // constructor(
  //   protected commentsQueryRepository: CommentsQueryRepository,
  //   private commandBus: CommandBus,
  // ) {}
  // @Public()
  // @Get(':id')
  // async getComment(@Param('id') id: string, @Req() req: Request) {
  //   return await this.commentsQueryRepository.findComment(id, req.user?.userId);
  // }
  // @UseGuards(AuthBearerGuard)
  // @Put(':commentId/like-status')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async changeCommentLikeStatus(
  //   @Body() inputModel: LikeStatusInputModel,
  //   @Param('commentId') commentId: string,
  //   @Req() req: Request,
  // ) {
  //   const comment = await this.commentsQueryRepository.findComment(commentId);
  //   if (!comment) {
  //     throw new NotFoundException('Comment not found');
  //   }
  //   await this.commandBus.execute(
  //     new ChangeLikeStatusCommand(commentId, inputModel, req.user!.userId, req.user!.login),
  //   );
  // }
  // @UseGuards(AuthBearerGuard)
  // @Put(':commentId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async createCommentForPost(
  //   @Body() inputModel: CreateCommentInputModel,
  //   @Param('commentId') commentId: string,
  //   @Req() req: Request,
  // ) {
  //   const comment = await this.commentsQueryRepository.findComment(commentId);
  //   if (!comment) {
  //     throw new NotFoundException('Comment not found');
  //   }
  //   await this.commandBus.execute(
  //     new UpdateCommentCommand(inputModel, comment, req.user!.userId, req.user!.login),
  //   );
  // }
  // @UseGuards(AuthBearerGuard)
  // @Delete(':commentId')
  // @HttpCode(HttpStatus.NO_CONTENT)
  // async deleteComment(@Param('commentId') commentId: string, @Req() req: Request) {
  //   const comment = await this.commentsQueryRepository.findComment(commentId);
  //   if (!comment) {
  //     throw new NotFoundException('Comment not found');
  //   }
  //   await this.commandBus.execute(
  //     new DeleteCommentCommand(comment, req.user!.userId, req.user!.login),
  //   );
  // }
}
