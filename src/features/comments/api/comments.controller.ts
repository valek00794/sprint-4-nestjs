import { Controller, Get, Param } from '@nestjs/common';

import { SETTINGS } from 'src/settings/settings';
import type { CommentsQueryRepository } from '../infrastructure/comments.query-repository';

@Controller(SETTINGS.PATH.comments)
export class CommentsController {
  constructor(protected commentsQueryRepository: CommentsQueryRepository) {}

  @Get(':id')
  async getComment(@Param('id') id: string) {
    return await this.commentsQueryRepository.findComment(id);
  }
}
