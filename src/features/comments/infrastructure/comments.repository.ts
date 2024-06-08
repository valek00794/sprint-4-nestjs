import { Injectable } from '@nestjs/common';
import { Comment, CommentsDocument } from './comments.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
  constructor(@InjectModel(Comment.name) private CommentModel: Model<CommentsDocument>) {}

  async createComment(newComment: Comment): Promise<CommentsDocument> {
    const comment = new this.CommentModel(newComment);
    await comment.save();
    return comment;
  }

  async updateComment(updatedComment: Comment, commentId: string): Promise<boolean> {
    const updatedResult = await this.CommentModel.findByIdAndUpdate(commentId, updatedComment, {
      new: true,
    });
    return updatedResult ? true : false;
  }

  async deleteComment(id: string): Promise<boolean> {
    const deleteResult = await this.CommentModel.findByIdAndDelete(id);
    return deleteResult ? true : false;
  }

  async findComment(id: string): Promise<CommentsDocument | null> {
    return await this.CommentModel.findById(id);
  }
}
