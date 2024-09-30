import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersBanInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: false })
  userId: number;

  @Column({ type: 'boolean', default: false })
  isBanned: boolean;

  @Column({ type: 'varchar', length: 255, nullable: false })
  banReason: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  banDate: string;
}
