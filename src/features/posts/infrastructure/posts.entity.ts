import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Comment } from 'src/features/comments/infrastructure/comments.entity';
import { Blog } from 'src/features/blogs/infrastructure/blogs.entity';
import { PostsLike } from 'src/features/likes/infrastructure/postslikes.entity';
import { CreatePostForBlogModel } from 'src/features/blogs/api/models/input/blogs.input.model';
import { CreatePostModel } from '../api/models/input/posts.input.model';
import { PostCreatedEvent } from '../domain/events/post-created.event';
import { AggregateRoot } from '@nestjs/cqrs';

@Entity()
export class Post extends AggregateRoot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  shortDescription: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  content: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @ManyToOne(() => Blog, (blog) => blog.posts, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'blogId' })
  blog: Blog;

  @Column()
  blogId: string;

  @OneToMany(() => Comment, (comment) => comment.post)
  comments: Comment[];

  @OneToMany(() => PostsLike, (likes) => likes.post)
  likes: PostsLike[];

  static create(inputModel: CreatePostModel | CreatePostForBlogModel, blogId: string) {
    const newPost = new Post();
    newPost.title = inputModel.title;
    newPost.shortDescription = inputModel.shortDescription;
    newPost.content = inputModel.content;
    newPost.createdAt = new Date().toISOString();
    newPost.blogId = blogId;

    const postCreatedEvent = new PostCreatedEvent(blogId);

    newPost.apply(postCreatedEvent);

    return newPost;
  }
}
