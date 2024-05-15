import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { BlogsController } from './features/blogs/api/blogs.controller';
import { BlogsService } from './features/blogs/api/app/blogs.service';
import { BlogsRepository } from './features/blogs/infrastructure/blogs.repository';
import { SETTINGS } from './settings';
import { BlogsQueryRepository } from './features/blogs/infrastructure/blogs.query-repository';
import { Blog, BlogsSchema } from './features/blogs/infrastructure/blogs-schema';
import { ClearDbController } from './features/dev/clear-db.controller';
import { DbService } from './features/dev/db.service';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsRepository } from './features/posts/infrastructure/posts.repository';
import { PostsQueryRepository } from './features/posts/infrastructure/posts.query-repository';
import { PostsService } from './features/posts/api/app/posts.service';
import { Post, PostsSchema } from './features/posts/infrastructure/posts-schema';

@Module({
  imports: [
    MongooseModule.forRoot(SETTINGS.DB.mongoURI),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogsSchema,
      },
      {
        name: Post.name,
        schema: PostsSchema,
      },
    ]),
  ],
  controllers: [BlogsController, ClearDbController, PostsController],
  providers: [
    BlogsService,
    BlogsRepository,
    BlogsQueryRepository,
    DbService,
    PostsService,
    PostsRepository,
    PostsQueryRepository,
  ],
})
export class AppModule {}
