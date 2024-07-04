import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';

import { CreateCommentInputModel } from '../../api/models/input/comments.input.model';
import { CommentatorInfo } from '../../domain/comments.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';

export class CreateCommentCommand {
  constructor(
    public inputModel: CreateCommentInputModel,
    public postId: string,
    public userId: string,
    public userLogin: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<CreateCommentCommand> {
  constructor(
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<number | null> {
    const post = await this.postsRepository.findPost(command.postId);
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const commentatorInfo = new CommentatorInfo(Number(command.userId), command.userLogin);
    const newComment = {
      content: command.inputModel.content,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        ...commentatorInfo,
      },
      postId: Number(command.postId),
    };
    return await this.commentsRepository.createComment(newComment);
  }
}
