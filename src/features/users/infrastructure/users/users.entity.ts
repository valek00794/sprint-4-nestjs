import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEmailConfirmationInfo } from './usersEmailConfirmationInfo.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  login: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ type: 'timestamp with time zone', nullable: false })
  createdAt: string;

  @Column({ type: 'varchar', length: 255, nullable: false })
  passwordHash: string;

  @OneToOne(() => UserEmailConfirmationInfo, { nullable: true, cascade: true })
  @JoinColumn()
  emailConfirmation: UserEmailConfirmationInfo | null;
}
