import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { SearchQueryParametersType } from 'src/features/domain/query.types';
import { BlogsQueryRepository } from '../../infrastructure/blogs.query-repository';

export class GetBlogsCommand {
  constructor(
    public query?: SearchQueryParametersType,
    public userId?: string,
  ) {}
}

@CommandHandler(GetBlogsCommand)
export class GetBlogsUseCase implements ICommandHandler<GetBlogsCommand> {
  constructor(protected blogsQueryRepository: BlogsQueryRepository) {}

  async execute(command: GetBlogsCommand) {
    const userId = Number(command.userId);
    return await this.blogsQueryRepository.getBlogs(command.query, false, userId);
  }
}
