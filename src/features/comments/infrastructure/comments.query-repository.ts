import { Injectable, NotFoundException } from '@nestjs/common';
import { Comment, CommentDocument } from './comments.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

@Injectable()
export class CommentsQueryRepository {
  constructor(@InjectModel(Comment.name) private commentModel: Model<CommentDocument>) {}

  async findComment(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Invalid ID');
    }
    const comment = await this.commentModel.findById(id);
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }
    return comment;
  }
}
