import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CreateCommentInputModel } from '../../api/models/input/comments.input.model';
import { CommentatorInfo } from '../../domain/comments.types';
import { CommentsRepository } from '../../infrastructure/comments.repository';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { BanInfoRepository } from 'src/features/users/infrastructure/banInfo/banInfo.repository';

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
    protected usersBanInfoRepository: BanInfoRepository,
  ) {}

  async execute(command: CreateCommentCommand): Promise<string> {
    const post = await this.postsRepository.findPostbyId(command.postId);
    if (!post || post.blog.isBanned) {
      throw new NotFoundException('Post not found');
    }
    const banInfo = await this.usersBanInfoRepository.getBanInfoBlog(post.blog.id, command.userId);
    if (banInfo) {
      throw new ForbiddenException('You are banned for this blog');
    }
    const commentatorInfo = new CommentatorInfo(command.userId, command.userLogin);

    const newComment = {
      content: command.inputModel.content,
      createdAt: new Date().toISOString(),
      commentatorInfo: {
        ...commentatorInfo,
      },
      postId: command.postId,
    };
    return await this.commentsRepository.createComment(newComment);
  }
}
