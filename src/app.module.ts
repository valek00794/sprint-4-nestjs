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

@Module({
  imports: [
    MongooseModule.forRoot(SETTINGS.DB.mongoURI),
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogsSchema,
      },
    ]),
  ],
  controllers: [BlogsController, ClearDbController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository, DbService],
})
export class AppModule {}
