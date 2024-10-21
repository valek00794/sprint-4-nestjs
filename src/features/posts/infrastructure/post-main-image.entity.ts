import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { PostImageSizeType } from '../../blogs/domain/image.types';

@Entity()
export class PostMainImageInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  postId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  sizeType: PostImageSizeType;

  @Column({ type: 'varchar', length: 255, nullable: false })
  key: string;

  @Column({ type: 'int', nullable: false })
  width: number;

  @Column({ type: 'int', nullable: false })
  height: number;

  @Column({ type: 'int', nullable: false })
  size: number;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: string;
}
