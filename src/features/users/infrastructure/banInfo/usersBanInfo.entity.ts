import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersBanInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: 'varchar', length: 255, nullable: false })
  banReason: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  banDate: string;
}
