import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class BlogMainImageInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blogId: string;

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
