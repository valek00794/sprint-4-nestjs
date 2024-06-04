import { Injectable } from '@nestjs/common';
import { Blog, BlogDocument } from './blogs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { SearchQueryParametersType } from '../../domain/query.types';
import { getSanitizationQuery } from 'src/features/utils';
import { Paginator } from 'src/features/domain/result.types';
import { BlogView } from '../api/models/output/blogs.output.model';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlogs(query?: SearchQueryParametersType) {
    const sanitizationQuery = getSanitizationQuery(query);
    const findOptions =
      sanitizationQuery.searchNameTerm !== null
        ? { name: { $regex: sanitizationQuery.searchNameTerm, $options: 'i' } }
        : {};

    const blogs = await this.blogModel
      .find(findOptions)
      .sort({ [sanitizationQuery.sortBy]: sanitizationQuery.sortDirection })
      .skip((sanitizationQuery.pageNumber - 1) * sanitizationQuery.pageSize)
      .limit(sanitizationQuery.pageSize);

    const blogsCount = await this.blogModel.countDocuments(findOptions);

    return new Paginator<BlogView[]>(
      sanitizationQuery.pageNumber,
      sanitizationQuery.pageSize,
      blogsCount,
      blogs.map((blog) => this.mapToOutput(blog)),
    );
  }

  async findBlog(id: string): Promise<BlogView | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    const blog = await this.blogModel.findById(id);
    return blog ? this.mapToOutput(blog) : null;
  }

  mapToOutput(blog: BlogDocument): BlogView {
    return new BlogView(
      blog._id,
      blog.name,
      blog.description,
      blog.websiteUrl,
      blog.createdAt,
      blog.isMembership,
    );
  }
}
