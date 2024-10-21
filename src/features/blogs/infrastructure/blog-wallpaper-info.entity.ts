import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class BlogWallpaperInfo {
  @PrimaryColumn('uuid')
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
