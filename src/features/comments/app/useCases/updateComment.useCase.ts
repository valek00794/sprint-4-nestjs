import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';

import { CreateCommentInputModel } from '../../api/models/input/comments.input.model';
import { CommentatorInfo } from '../../domain/comments.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { CommentDocument } from '../../infrastructure/comments.schema';

export class UpdateCommentCommand {
  constructor(
    public inputModel: CreateCommentInputModel,
    public comment: CommentDocument,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<UpdateCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: UpdateCommentCommand) {
    // const commentatorInfo = new CommentatorInfo(command.userId, command.userLogin);
    // if (
    //   command.comment.commentatorInfo.userId !== commentatorInfo.userId &&
    //   command.comment.commentatorInfo.userLogin !== commentatorInfo.userLogin
    // ) {
    //   throw new ForbiddenException('User not author of comment');
    // }
    // const updatedComment = {
    //   content: command.inputModel.content,
    //   commentatorInfo: {
    //     userId: command.comment.commentatorInfo.userId,
    //     userLogin: command.comment.commentatorInfo.userLogin,
    //   },
    //   createdAt: command.comment.createdAt,
    //   postId: command.comment.postId,
    // };
    // return await this.commentsRepository.updateComment(
    //   updatedComment,
    //   command.comment.id.toString(),
    // );
    return command;
  }
}
