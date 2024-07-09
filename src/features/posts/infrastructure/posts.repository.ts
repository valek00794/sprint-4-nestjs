import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { PostEntity } from './posts.entity';

@Injectable()
export class PostsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPost(newPosts: PostEntity) {
    const query = `
      INSERT INTO "posts" ("BlogId", "Content", "ShortDescription", "CreatedAt", "Title")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id" as "id", "BlogId" as "blogId", "Content" as "content", 
        "ShortDescription" as "shortDescription", "CreatedAt" as "createdAt",  "Title" as "title",
           (
            SELECT "Name"
            FROM "blogs"
            WHERE "Id" = $1
          ) as "blogName";
    `;
    const post = await this.dataSource.query(query, [
      newPosts.blogId,
      newPosts.content,
      newPosts.shortDescription,
      newPosts.createdAt,
      newPosts.title,
    ]);
    return post.length !== 0 ? post[0] : null;
  }
  async findPost(postId: string): Promise<PostEntity | null> {
    const query = `
      SELECT "Id" as "id", "Title" as "title", "ShortDescription" as "shortDescription", 
        "Content" as "content", "BlogId" as "blogId",  "CreatedAt" as "createdAt"
      FROM "posts"
      WHERE "Id" = $1;
    `;
    const post = await this.dataSource.query(query, [postId]);
    return post.length !== 0 ? post[0] : null;
  }
  async updatePost(updatedPost: PostEntity, postId: string): Promise<boolean> {
    const query = `
    UPDATE "posts"
      SET "BlogId" = '${updatedPost.blogId}', "Content" = '${updatedPost.content}', "ShortDescription" = '${updatedPost.shortDescription}', 
        "CreatedAt" = '${updatedPost.createdAt}', "Title" = '${updatedPost.title}'
      WHERE "Id" = $1
      RETURNING "Id" as "id", "BlogId" as "blogId", "Content" as "content", 
        "ShortDescription" as "shortDescription", "CreatedAt" as "createdAt",  "Title" as "title";
    `;
    const post = await this.dataSource.query(query, [postId]);
    return post.length !== 0 ? post[0] : null;
  }
  async deletePost(postId: string): Promise<boolean> {
    const query = `
      DELETE FROM "posts"
      WHERE "Id" = $1;
    `;
    const result = await this.dataSource.query(query, [postId]);
    return result[1] === 1 ? true : false;
  }
}
