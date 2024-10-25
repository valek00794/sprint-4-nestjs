import { CommandHandler, EventBus, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { CreatePostForBlogModel } from 'src/features/blogs/api/models/input/blogs.input.model';
import { BlogsRepository } from 'src/features/blogs/infrastructure/blogs.repository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CreatePostModel } from 'src/features/posts/api/models/input/posts.input.model';
import { PostsRepository } from 'src/features/posts/infrastructure/posts.repository';
import { Post } from 'src/features/posts/infrastructure/posts.entity';
export class CreatePostCommand {
  constructor(
    public inputModel: CreatePostModel | CreatePostForBlogModel,
    public blogId?: string,
    public userId?: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    protected postsRepository: PostsRepository,
    protected blogsRepository: BlogsRepository,
    protected publisher: EventPublisher,
    protected eventBus: EventBus,
  ) {}

  async execute(command: CreatePostCommand) {
    const getBlogId = command.blogId ? command.blogId : command.inputModel.blogId;
    const blog = await this.blogsRepository.findBlogById(getBlogId);
    if (!blog) {
      throw new NotFoundException('Blog not found');
    }
    if (command.userId !== blog.blogOwnerInfo!.id) {
      throw new ForbiddenException(
        'The user is trying to create a post for a blog that does not belong to them.',
      );
    }
    const newPost = Post.create(command.inputModel, getBlogId);
    const savedPost = await this.postsRepository.createPost(newPost);
    //newPost.getUncommittedEvents().forEach((e) => this.eventBus.publish(e));
    this.publisher.mergeObjectContext(newPost);
    newPost.commit();
    return savedPost;
  }
}
