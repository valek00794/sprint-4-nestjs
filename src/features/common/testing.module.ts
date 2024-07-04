import { Module } from '@nestjs/common';
import { ClearDbController } from './api/clear-db.controller';
import { DbService } from './app/db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CommentsSchema, Comment } from '../comments/infrastructure/comments.schema';
import { Like, LikeSchema } from '../likes/infrastructure/likes.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
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
