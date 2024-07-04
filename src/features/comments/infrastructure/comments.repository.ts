import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { Comment, CommentRaw } from '../domain/comments.types';
import { CommentsEntity } from './comments.entity';
@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async createComment(newComment: Comment): Promise<number | null> {
    const createCommentQuery = `
    INSERT INTO "comments" ("Content", "CommentatorId", "PostId", "CreatedAt")
    VALUES ($1, $2, $3, $4)
    RETURNING "Id" as "id"
  `;
    const createdComment = await this.dataSource.query<CommentsEntity[]>(createCommentQuery, [
      newComment.content,
      newComment.commentatorInfo.userId,
      newComment.postId,
      newComment.createdAt,
    ]);
    return createdComment.length !== 0 ? createdComment[0].id : null;
  }
  async updateComment(updateComment: Comment, commentId: number): Promise<number | null> {
    const query = `
      UPDATE "comments"
      SET "Content" = $2, "CommentatorId" = $3, "PostId" = $4, "CreatedAt" = $5
      WHERE "Id" = $1
      RETURNING "Id" as "id"
      `;
    const updatedComment = await this.dataSource.query<CommentsEntity[]>(query, [
      commentId,
      updateComment.content,
      updateComment.commentatorInfo.userId,
      updateComment.postId,
      updateComment.createdAt,
    ]);
    return updatedComment.length !== 0 ? updatedComment[0].id : null;
  }
  async deleteComment(id: number): Promise<boolean> {
    const query = `
    DELETE FROM "comments"
    WHERE "Id" = $1;
  `;
    const result = await this.dataSource.query(query, [id]);
    return result[1] === 1 ? true : false;
  }
  async findComment(id: number): Promise<CommentRaw | null> {
    const query = `
    SELECT  c."Id" as "id",  c."Content" as "content",  c."CommentatorId" as "userId",  c."PostId" as "postId",  c."CreatedAt" as "createdAt", 
      u."Login" as "userLogin"
     FROM "comments" c
     JOIN "users" u ON c."CommentatorId" = u."Id"
     WHERE c."Id" = $1;
   `;
    const comment = await this.dataSource.query<CommentRaw[]>(query, [id]);
    return comment.length !== 0 ? comment[0] : null;
  }
}
