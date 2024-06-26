import { Module } from '@nestjs/common';
import { ClearDbController } from './api/clear-db.controller';
import { DbService } from './app/db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogsSchema } from '../blogs/infrastructure/blogs.schema';
import { Post, PostsSchema } from '../posts/infrastructure/posts.schema';
import { CommentsSchema, Comment } from '../comments/infrastructure/comments.schema';
import { Like, LikeSchema } from '../likes/infrastructure/likes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogsSchema,
      },
      {
        name: Post.name,
        schema: PostsSchema,
      },
      {
        name: Comment.name,
        schema: CommentsSchema,
      },
      {
        name: Like.name,
        schema: LikeSchema,
      },
    ]),
  ],
  controllers: [ClearDbController],
  providers: [DbService],
})
export class TestingModule {}
