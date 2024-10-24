import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserEmailConfirmationInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  confirmationCode: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  expirationDate: Date;

  @Column({ type: 'boolean', nullable: false })
  isConfirmed: boolean;

  @OneToOne(() => User, (u) => u.emailConfirmation, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @Column({ type: 'varchar', nullable: false })
  userId: string;
}
