import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersDevices {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  deviceId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  ip: string;

  @Column({ type: 'varchar', nullable: false })
  userId: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  lastActiveDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expiryDate: Date;
}
