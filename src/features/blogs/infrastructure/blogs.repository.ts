import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

import { Blog } from './blogs.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBlog(newBlog: Blog) {
    const query = `
      INSERT INTO "blogs" ("Name", "Description", "WebsiteUrl", "CreatedAt", "IsMembership")
      VALUES ('${newBlog.name}', '${newBlog.description}', '${newBlog.websiteUrl}', '${newBlog.createdAt}', '${newBlog.isMembership}')
      RETURNING "Id" as "id", "Name" as "name", "Description" as "description", 
        "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt",  "IsMembership" as "isMembership";
    `;
    const blog = await this.dataSource.query(query);
    return blog.length !== 0 ? blog[0] : null;
  }
  async findBlog(id: number): Promise<Blog | null> {
    const query = `
     SELECT "Id" as "id", "Name" as "name", "Description" as "description", 
        "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt",  "IsMembership" as "isMembership"
      FROM "blogs" 
      WHERE "Id" = '${id}';
    `;
    const blog = await this.dataSource.query(query);
    return blog.length !== 0 ? blog[0] : null;
  }
  async updateBlog(updatedBlog: Blog, id: string): Promise<boolean> {
    const query = `
      UPDATE "blogs"
      SET "Name" = '${updatedBlog.name}', "Description" = '${updatedBlog.description}', "WebsiteUrl" = '${updatedBlog.websiteUrl}', 
        "CreatedAt" = '${updatedBlog.createdAt}', "IsMembership" = '${updatedBlog.isMembership}'
      WHERE "Id" = $1
      RETURNING "Id" as "id", "Name" as "name", "Description" as "description", 
        "WebsiteUrl" as "websiteUrl", "CreatedAt" as "createdAt",  "IsMembership" as "isMembership";
    `;
    const blog = await this.dataSource.query(query, [id]);
    return blog.length !== 0 ? blog[0] : null;
  }
  async deleteBlog(id: number): Promise<boolean> {
    const query = `
      DELETE FROM "blogs"
      WHERE "Id" = '${id}';
    `;
    const blog = await this.dataSource.query(query);
    return blog.length !== 0 ? blog[0] : null;
  }
}
