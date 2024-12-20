import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UsersRecoveryPasssword {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expirationDate: Date;

  @Column({ type: 'varchar', length: 255, nullable: false })
  recoveryCode: string;
}
