import { Injectable } from '@nestjs/common';

@Injectable()
export class CommentsRepository {
  // constructor(@InjectModel(Comment.name) private CommentModel: Model<CommentDocument>) {}
  // async createComment(newComment: Comment): Promise<CommentDocument> {
  //   const comment = new this.CommentModel(newComment);
  //   await comment.save();
  //   return comment;
  // }
  // async updateComment(updatedComment: Comment, commentId: string): Promise<boolean> {
  //   const updatedResult = await this.CommentModel.findByIdAndUpdate(commentId, updatedComment, {
  //     new: true,
  //   });
  //   return updatedResult ? true : false;
  // }
  // async deleteComment(id: string): Promise<boolean> {
  //   const deleteResult = await this.CommentModel.findByIdAndDelete(id);
  //   return deleteResult ? true : false;
  // }
  // async findComment(id: string): Promise<CommentDocument | null> {
  //   return await this.CommentModel.findById(id);
  // }
}
