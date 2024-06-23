import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersDevices {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  deviceId: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  ip: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userId: string | null;

  @Column({ type: 'datetime', nullable: true })
  lastActiveDate: Date | null;

  @Column({ type: 'datetime', nullable: true })
  expiryDate: Date | null;
}
