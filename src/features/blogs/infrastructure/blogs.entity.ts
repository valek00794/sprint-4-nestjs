import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post } from 'src/features/posts/infrastructure/posts.entity';
import { User } from 'src/features/users/infrastructure/users/users.entity';
import { BlogWallpaperInfo } from './blog-wallpaper-info.entity';
import { BlogMainImagesInfo } from './blog-main-images-info.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false, collation: 'C' })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  websiteUrl: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @Column({ type: 'boolean', nullable: false })
  isMembership: boolean;

  @OneToMany(() => Post, (post) => post.blog)
  posts: Post[];

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  blogOwnerInfo: User | null;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: 'timestamp with time zone', default: null })
  banDate: string | null;

  @OneToOne(() => BlogWallpaperInfo)
  @JoinColumn()
  wallpaperImage: BlogWallpaperInfo | null;

  @OneToMany(() => BlogMainImagesInfo, (image) => image.blogId)
  @JoinColumn()
  mainImages: BlogMainImagesInfo[] | null;
}
